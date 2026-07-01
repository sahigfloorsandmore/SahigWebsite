const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Manually parse .env.local to avoid adding dotenv dependency
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local file not found.");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Remove surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting data migration to Supabase...");

  // --- 1. Migrate Categories ---
  const categoriesPath = path.join(__dirname, "..", "src", "data", "categories.json");
  if (fs.existsSync(categoriesPath)) {
    try {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf8"));
      console.log(`Found ${categories.length} categories to migrate.`);
      for (const cat of categories) {
        const { error } = await supabase
          .from("categories")
          .upsert({ name: cat }, { onConflict: "name" });
        if (error) throw error;
      }
      console.log("✓ Categories migrated successfully.");
    } catch (err) {
      console.error("Error migrating categories:", err.message);
    }
  }

  // --- 2. Migrate Settings ---
  const settingsPath = path.join(__dirname, "..", "src", "data", "settings.json");
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      console.log("Migrating settings...");
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "config",
          recipient_emails: settings.recipientEmails || "",
          webhook_secret: settings.webhookSecret || "",
          instagram_webhook: settings.instagramWebhook || "",
          linkedin_webhook: settings.linkedinWebhook || ""
        }, { onConflict: "key" });
      if (error) throw error;
      console.log("✓ Settings migrated successfully.");
    } catch (err) {
      console.error("Error migrating settings:", err.message);
    }
  }

  // --- 3. Migrate Blog Posts ---
  const blogPath = path.join(__dirname, "..", "src", "data", "blog.json");
  if (fs.existsSync(blogPath)) {
    try {
      const posts = JSON.parse(fs.readFileSync(blogPath, "utf8"));
      console.log(`Found ${posts.length} blog posts to migrate.`);
      for (const post of posts) {
        const { error } = await supabase
          .from("blog_posts")
          .upsert({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            image: post.image,
            date: post.date,
            source: post.source || "Manual",
            source_url: post.sourceUrl || null
          }, { onConflict: "id" });
        if (error) throw error;
      }
      console.log("✓ Blog posts migrated successfully.");
    } catch (err) {
      console.error("Error migrating blog posts:", err.message);
    }
  }

  // --- 4. Migrate Leads ---
  const leadsPath = path.join(__dirname, "..", "src", "data", "leads.json");
  if (fs.existsSync(leadsPath)) {
    try {
      const leads = JSON.parse(fs.readFileSync(leadsPath, "utf8"));
      console.log(`Found ${leads.length} leads to migrate.`);
      for (const lead of leads) {
        // Map fields
        const { error } = await supabase
          .from("leads")
          .upsert({
            id: lead.id.length > 20 ? undefined : undefined, // let Supabase generate UUID if it's not a UUID
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            service: lead.service,
            contact_method: lead.contactMethod,
            message: lead.message,
            status: lead.status || "New",
            created_at: lead.createdAt
          });
        if (error) throw error;
      }
      console.log("✓ Leads migrated successfully.");
    } catch (err) {
      console.error("Error migrating leads:", err.message);
    }
  }

  console.log("\nMigration completed!");
}

seed();
