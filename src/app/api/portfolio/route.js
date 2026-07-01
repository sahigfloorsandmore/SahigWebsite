import { promises as fs } from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";


const uploadDir = path.join(process.cwd(), "public", "images", "portfolio");

// Fetch Projects
export async function GET(req) {
  try {
    const { data: projects, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = projects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      image: p.image,
      createdAt: p.created_at
    }));

    return Response.json(mapped);
  } catch (error) {
    console.error("Portfolio GET Error:", error);
    return Response.json({ message: "Failed to read project database" }, { status: 500 });
  }
}

// Add Project with local file upload support
export async function POST(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const description = formData.get("description");
    const imageFile = formData.get("imageFile"); // file object
    const imageUrl = formData.get("imageUrl"); // fallback URL string

    if (!title || !category || !description) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    let finalImagePath = "";

    // Handle file upload
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Ignore
      }
      const byteData = await imageFile.arrayBuffer();
      const buffer = Buffer.from(byteData);
      
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      finalImagePath = `/images/portfolio/${fileName}`;
    } else if (imageUrl) {
      finalImagePath = imageUrl;
    } else {
      return Response.json({ message: "Project image is required" }, { status: 400 });
    }

    const { data: newProject, error } = await supabase
      .from("portfolio_projects")
      .insert({
        title,
        category,
        description,
        image: finalImagePath
      })
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      id: newProject.id,
      title: newProject.title,
      category: newProject.category,
      description: newProject.description,
      image: newProject.image,
      createdAt: newProject.created_at
    };

    return Response.json({ success: true, project: mapped });
  } catch (error) {
    console.error("Portfolio POST Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Delete Project & Clean up files
export async function DELETE(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ message: "Missing project ID" }, { status: 400 });
    }

    const { data: project, error: fetchError } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    if (project.image && project.image.startsWith("/images/portfolio/")) {
      try {
        const fileName = project.image.replace("/images/portfolio/", "");
        const filePath = path.join(uploadDir, fileName);
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("Could not clean up image file on disk:", err.message);
      }
    }

    const { error: deleteError } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Portfolio DELETE Error:", error);
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
