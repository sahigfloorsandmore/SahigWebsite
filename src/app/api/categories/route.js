import { supabase } from "@/lib/supabase";

// Public Fetch Categories
export async function GET(req) {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("name");

    if (error) throw error;

    return Response.json(categories.map(c => c.name));
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

    const { data: existingData, error: fetchError } = await supabase
      .from("categories")
      .select("name");

    if (fetchError) throw fetchError;

    const existingNames = existingData.map(c => c.name);

    const toInsert = categories.filter(c => !existingNames.includes(c));
    const toDelete = existingNames.filter(c => !categories.includes(c));

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase
        .from("categories")
        .delete()
        .in("name", toDelete);
      if (delErr) throw delErr;
    }

    if (toInsert.length > 0) {
      const { error: insErr } = await supabase
        .from("categories")
        .insert(toInsert.map(name => ({ name })));
      if (insErr) throw insErr;
    }

    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("Categories PUT Error:", error);
    return Response.json({ message: "Failed to save categories" }, { status: 500 });
  }
}
