import { promises as fs } from "fs";
import path from "path";

const blogPath = path.join(process.cwd(), "src", "data", "blog.json");
const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");

// Helper to load webhook secret token from settings
async function getWebhookSecret() {
  try {
    const fileData = await fs.readFile(settingsPath, "utf8");
    const settings = JSON.parse(fileData);
    if (settings.webhookSecret) {
      return settings.webhookSecret;
    }
    // Generate one if missing
    const generatedSecret = `sb_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    settings.webhookSecret = generatedSecret;
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf8");
    return generatedSecret;
  } catch (error) {
    return "sahig-blog-secret-fallback";
  }
}

// Helper to dispatch cross-posting webhooks
async function dispatchCrossPosting(post) {
  try {
    const fileData = await fs.readFile(settingsPath, "utf8");
    const settings = JSON.parse(fileData);

    const payload = {
      title: post.title,
      content: post.content,
      image: post.image,
      date: post.date,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahig.ca"}/blog`
    };

    if (settings.instagramWebhook) {
      fetch(settings.instagramWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((e) => console.error("Instagram dispatch failed:", e));
    }

    if (settings.linkedinWebhook) {
      fetch(settings.linkedinWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((e) => console.error("LinkedIn dispatch failed:", e));
    }
  } catch (error) {
    console.error("Cross-posting dispatch error:", error);
  }
}

export async function POST(req) {
  try {
    // 1. Verify Secret Key
    const url = new URL(req.url);
    const secretQuery = url.searchParams.get("secret");
    const secretHeader = req.headers.get("x-webhook-secret");
    
    const configuredSecret = await getWebhookSecret();
    
    if (secretQuery !== configuredSecret && secretHeader !== configuredSecret) {
      return Response.json({ message: "Unauthorized access - Invalid Webhook Token" }, { status: 401 });
    }

    // 2. Parse Payload
    const body = await req.json();
    const { content, image, imageUrl, sourceUrl, title: passedTitle } = body;

    if (!content) {
      return Response.json({ message: "Content body is required" }, { status: 400 });
    }

    // Clean content (remove extra spacing, trailing hashtags)
    const cleanedContent = content.trim();

    // 3. Generate Title (if not passed)
    let generatedTitle = passedTitle || "";
    if (!generatedTitle) {
      // Grab first sentence or first 8 words
      const sentences = cleanedContent.split(/[.!?]/);
      const firstLine = sentences[0] ? sentences[0].trim() : "";
      
      if (firstLine.length > 5 && firstLine.length < 80) {
        generatedTitle = firstLine;
      } else {
        const words = cleanedContent.split(/\s+/).slice(0, 7).join(" ");
        generatedTitle = words.length > 5 ? `${words}...` : `Social Update - ${new Date().toLocaleDateString()}`;
      }
      
      // Clean up common symbols or trailing commas
      generatedTitle = generatedTitle.replace(/[#*`_\[\]()]/g, "").trim();
    }

    // 4. Generate Excerpt
    const excerpt = cleanedContent.length > 130 
      ? `${cleanedContent.substring(0, 130).replace(/\s+\S*$/, "")}...`
      : cleanedContent;

    // 5. Mapped Image
    const postImage = imageUrl || image || "/images/services/tile.png";

    // 6. Create Blog Entry
    const newPost = {
      id: Date.now().toString(),
      title: generatedTitle,
      excerpt: excerpt,
      content: cleanedContent,
      image: postImage,
      date: new Date().toISOString(),
      source: "Facebook",
      sourceUrl: sourceUrl || ""
    };

    // 7. Save to Database
    let posts = [];
    try {
      const fileData = await fs.readFile(blogPath, "utf8");
      posts = JSON.parse(fileData);
    } catch (e) {
      // File missing, fallback to empty array
    }

    posts.unshift(newPost); // Add to the top
    await fs.writeFile(blogPath, JSON.stringify(posts, null, 2), "utf8");

    // Asynchronously trigger cross-posting social integrations
    dispatchCrossPosting(newPost);

    return Response.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Facebook Sync Webhook Error:", error);
    return Response.json({ message: "Error parsing sync payload" }, { status: 500 });
  }
}
