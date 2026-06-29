import { promises as fs } from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");

// Fetch Settings
export async function GET(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    let settings = { recipientEmails: "admin@sahig.ca" };
    try {
      const fileData = await fs.readFile(settingsPath, "utf8");
      settings = JSON.parse(fileData);
    } catch (e) {
      // Ignore
    }
 
    if (!settings.webhookSecret) {
      settings.webhookSecret = `sb_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      try {
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf8");
      } catch (e) {
        console.error("Failed to write generated secret:", e);
      }
    }
 
    return Response.json(settings);
  } catch (error) {
    console.error("Settings GET Error:", error);
    return Response.json({ message: "Failed to read settings records" }, { status: 500 });
  }
}

// Update Settings
export async function PUT(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
 
    let existingSettings = {};
    try {
      const fileData = await fs.readFile(settingsPath, "utf8");
      existingSettings = JSON.parse(fileData);
    } catch (e) {
      // Ignore if missing
    }

    const newSettings = {
      ...existingSettings,
      ...body
    };

    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), "utf8");
 
    return Response.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return Response.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
