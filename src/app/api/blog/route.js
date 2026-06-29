import { promises as fs } from "fs";
import path from "path";

const blogPath = path.join(process.cwd(), "src", "data", "blog.json");
const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");

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

// Public Fetch Blog Posts
export async function GET(req) {
  try {
    let fileData = "[]";
    try {
      fileData = await fs.readFile(blogPath, "utf8");
    } catch (e) {
      // File missing, fallback to empty array
    }
    return Response.json(JSON.parse(fileData));
  } catch (error) {
    console.error("Blog GET Error:", error);
    return Response.json({ message: "Failed to read blog database" }, { status: 500 });
  }
}

// Authenticated Create Blog Post
export async function POST(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { title, excerpt, content, image } = body;

    if (!title || !content) {
      return Response.json({ message: "Title and content are required" }, { status: 400 });
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      excerpt: excerpt || (content.length > 130 ? `${content.substring(0, 130)}...` : content),
      content,
      image: image || "/images/services/tile.png",
      date: new Date().toISOString(),
      source: "Manual"
    };

    let posts = [];
    try {
      const fileData = await fs.readFile(blogPath, "utf8");
      posts = JSON.parse(fileData);
    } catch (e) {
      // Empty posts list
    }

    posts.unshift(newPost);
    await fs.writeFile(blogPath, JSON.stringify(posts, null, 2), "utf8");

    // Asynchronously trigger cross-posting social integrations
    dispatchCrossPosting(newPost);

    return Response.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Blog POST Error:", error);
    return Response.json({ message: "Failed to save blog post" }, { status: 500 });
  }
}

// Authenticated Edit/Update Blog Post
export async function PUT(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, excerpt, content, image } = body;

    if (!id || !title || !content) {
      return Response.json({ message: "Post ID, title and content are required" }, { status: 400 });
    }

    let posts = [];
    try {
      const fileData = await fs.readFile(blogPath, "utf8");
      posts = JSON.parse(fileData);
    } catch (e) {
      return Response.json({ message: "Blog database is empty" }, { status: 404 });
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return Response.json({ message: "Blog post not found" }, { status: 404 });
    }

    // Keep dynamic properties (date, source, sourceUrl) while updating values
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      excerpt: excerpt || (content.length > 130 ? `${content.substring(0, 130)}...` : content),
      content,
      image: image || posts[postIndex].image
    };

    await fs.writeFile(blogPath, JSON.stringify(posts, null, 2), "utf8");

    return Response.json({ success: true, post: posts[postIndex] });
  } catch (error) {
    console.error("Blog PUT Error:", error);
    return Response.json({ message: "Failed to update blog post" }, { status: 500 });
  }
}

// Authenticated Delete Blog Post
export async function DELETE(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ message: "Post ID is required" }, { status: 400 });
    }

    let posts = [];
    try {
      const fileData = await fs.readFile(blogPath, "utf8");
      posts = JSON.parse(fileData);
    } catch (e) {
      return Response.json({ message: "Blog database is empty" }, { status: 404 });
    }

    const filteredPosts = posts.filter((p) => p.id !== id);
    
    if (posts.length === filteredPosts.length) {
      return Response.json({ message: "Blog post not found" }, { status: 404 });
    }

    await fs.writeFile(blogPath, JSON.stringify(filteredPosts, null, 2), "utf8");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Blog DELETE Error:", error);
    return Response.json({ message: "Failed to delete blog post" }, { status: 500 });
  }
}
