import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "portfolio.json");
const uploadDir = path.join(process.cwd(), "public", "images", "portfolio");

// Fetch Projects
export async function GET(req) {
  try {
    let fileData = "[]";
    try {
      fileData = await fs.readFile(dbPath, "utf8");
    } catch (e) {
      // Empty database fallback
    }
    return Response.json(JSON.parse(fileData));
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
      const byteData = await imageFile.arrayBuffer();
      const buffer = Buffer.from(byteData);
      
      // Sanitize file name to prevent directory traversal or file-system conflicts
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      finalImagePath = `/images/portfolio/${fileName}`;
    } else if (imageUrl) {
      finalImagePath = imageUrl;
    } else {
      return Response.json({ message: "Project image is required" }, { status: 400 });
    }

    // Read existing database
    let projects = [];
    try {
      const fileData = await fs.readFile(dbPath, "utf8");
      projects = JSON.parse(fileData);
    } catch (e) {
      // Empty list fallback
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      category,
      description,
      image: finalImagePath,
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    await fs.writeFile(dbPath, JSON.stringify(projects, null, 2), "utf8");

    return Response.json({ success: true, project: newProject });
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

    let projects = [];
    try {
      const fileData = await fs.readFile(dbPath, "utf8");
      projects = JSON.parse(fileData);
    } catch (e) {
      return Response.json({ message: "No database records found" }, { status: 404 });
    }

    const project = projects.find(p => p.id === id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    // Clean up local disk file if it was uploaded to our portfolio folder
    if (project.image.startsWith("/images/portfolio/")) {
      try {
        const fileName = project.image.replace("/images/portfolio/", "");
        const filePath = path.join(uploadDir, fileName);
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("Could not clean up image file on disk:", err.message);
      }
    }

    const updatedProjects = projects.filter(p => p.id !== id);
    await fs.writeFile(dbPath, JSON.stringify(updatedProjects, null, 2), "utf8");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Portfolio DELETE Error:", error);
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
