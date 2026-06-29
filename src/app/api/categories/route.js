import { promises as fs } from "fs";
import path from "path";

const categoriesPath = path.join(process.cwd(), "src", "data", "categories.json");

// Public Fetch Categories
export async function GET(req) {
  try {
    let fileData = '["Flooring", "Renovations", "Floor Prep", "Specialty"]';
    try {
      fileData = await fs.readFile(categoriesPath, "utf8");
    } catch (e) {
      // Return defaults if database is missing
    }
    return Response.json(JSON.parse(fileData));
  } catch (error) {
    console.error("Categories GET Error:", error);
    return Response.json({ message: "Failed to read categories database" }, { status: 500 });
  }
}

// Authenticated Update Categories
export async function PUT(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories)) {
      return Response.json({ message: "Missing categories array payload" }, { status: 400 });
    }

    await fs.writeFile(categoriesPath, JSON.stringify(categories, null, 2), "utf8");

    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("Categories PUT Error:", error);
    return Response.json({ message: "Failed to save categories" }, { status: 500 });
  }
}
