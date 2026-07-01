import { supabase } from "@/lib/supabase";

// Helper to load webhook secret token from settings
async function getWebhookSecret() {
  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("webhook_secret")
      .eq("key", "config")
      .maybeSingle();

    if (settings && settings.webhook_secret) {
      return settings.webhook_secret;
    }

    const generatedSecret = `sb_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    await supabase
      .from("settings")
      .upsert({
        key: "config",
        webhook_secret: generatedSecret
      });
    return generatedSecret;
  } catch (error) {
    return "sahig-blog-secret-fallback";
  }
}

// Helper to dispatch cross-posting webhooks
async function dispatchCrossPosting(post) {
  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "config")
      .single();

    if (!settings) return;

    const payload = {
      title: post.title,
      content: post.content,
      image: post.image,
      date: post.date,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahig.ca"}/blog`
    };

    if (settings.instagram_webhook) {
      fetch(settings.instagram_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((e) => console.error("Instagram dispatch failed:", e));
    }

    if (settings.linkedin_webhook) {
      fetch(settings.linkedin_webhook, {
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
    const { content, image, imageUrl, sourceUrl, title: passedTitle, isVideo } = body;

    if (!content) {
      return Response.json({ message: "Content body is required" }, { status: 400 });
    }

    const cleanedContent = content.trim();

    // 3. Generate Title (if not passed)
    let generatedTitle = passedTitle || "";
    if (!generatedTitle) {
      const sentences = cleanedContent.split(/[.!?]/);
      const firstLine = sentences[0] ? sentences[0].trim() : "";
      
      if (firstLine.length > 5 && firstLine.length < 80) {
        generatedTitle = firstLine;
      } else {
        const words = cleanedContent.split(/\s+/).slice(0, 7).join(" ");
        generatedTitle = words.length > 5 ? `${words}...` : `Social Update - ${new Date().toLocaleDateString()}`;
      }
      
      generatedTitle = generatedTitle.replace(/[#*`_\[\]()]/g, "").trim();
    }

    // 4. Generate Excerpt
    const excerpt = cleanedContent.length > 130 
      ? `${cleanedContent.substring(0, 130).replace(/\s+\S*$/, "")}...`
      : cleanedContent;

    // 5. Mapped Image
    const postImage = imageUrl || image || "/images/services/tile.png";

    // 6. Create Blog Entry
    const isVideoPost = isVideo === true || isVideo === 'true' || isVideo === 'video';
    const newPost = {
      id: Date.now().toString(),
      title: generatedTitle,
      excerpt: excerpt,
      content: cleanedContent,
      image: postImage,
      date: new Date().toISOString(),
      source: "Facebook",
      source_url: sourceUrl || "",
      is_video: isVideoPost
    };

    // 7. Save to Database
    const { error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        id: newPost.id,
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        image: newPost.image,
        date: newPost.date,
        source: newPost.source,
        source_url: newPost.source_url,
        is_video: newPost.is_video
      });

    if (insertError) throw insertError;

    // Asynchronously trigger cross-posting social integrations
    dispatchCrossPosting(newPost);

    return Response.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Facebook Sync Webhook Error:", error);
    return Response.json({ message: "Error parsing sync payload" }, { status: 500 });
  }
}
