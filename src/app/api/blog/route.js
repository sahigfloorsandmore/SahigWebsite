import { supabase } from "@/lib/supabase";

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

// Public Fetch Blog Posts
export async function GET(req) {
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    const mappedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image,
      date: p.date,
      source: p.source,
      sourceUrl: p.source_url
    }));

    return Response.json(mappedPosts);
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

    const { error } = await supabase
      .from("blog_posts")
      .insert({
        id: newPost.id,
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        image: newPost.image,
        date: newPost.date,
        source: newPost.source
      });

    if (error) throw error;

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

    const updatedExcerpt = excerpt || (content.length > 130 ? `${content.substring(0, 130)}...` : content);

    const { data: updatedPost, error } = await supabase
      .from("blog_posts")
      .update({
        title,
        excerpt: updatedExcerpt,
        content,
        image
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const mappedPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      image: updatedPost.image,
      date: updatedPost.date,
      source: updatedPost.source,
      sourceUrl: updatedPost.source_url
    };

    return Response.json({ success: true, post: mappedPost });
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

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Blog DELETE Error:", error);
    return Response.json({ message: "Failed to delete blog post" }, { status: 500 });
  }
}

