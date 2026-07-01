import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";


// Fetch Settings
export async function GET(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    let { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "config")
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      const generatedSecret = `sb_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      const { data: insertedSettings, error: insertError } = await supabase
        .from("settings")
        .insert({
          key: "config",
          recipient_emails: "admin@sahig.ca",
          webhook_secret: generatedSecret
        })
        .select()
        .single();
      if (insertError) throw insertError;
      settings = insertedSettings;
    } else if (!settings.webhook_secret) {
      const generatedSecret = `sb_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      const { data: updatedSettings, error: updateError } = await supabase
        .from("settings")
        .update({ webhook_secret: generatedSecret })
        .eq("key", "config")
        .select()
        .single();
      if (updateError) throw updateError;
      settings = updatedSettings;
    }

    const mapped = {
      recipientEmails: settings.recipient_emails || "",
      webhookSecret: settings.webhook_secret || "",
      instagramWebhook: settings.instagram_webhook || "",
      linkedinWebhook: settings.linkedin_webhook || ""
    };

    return Response.json(mapped);
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

    const updateData = {};
    if (body.recipientEmails !== undefined) updateData.recipient_emails = body.recipientEmails;
    if (body.instagramWebhook !== undefined) updateData.instagram_webhook = body.instagramWebhook;
    if (body.linkedinWebhook !== undefined) updateData.linkedin_webhook = body.linkedinWebhook;
    if (body.webhookSecret !== undefined) updateData.webhook_secret = body.webhookSecret;

    const { data: newSettings, error: updateError } = await supabase
      .from("settings")
      .upsert({
        key: "config",
        ...updateData
      })
      .select()
      .single();

    if (updateError) throw updateError;

    const mapped = {
      recipientEmails: newSettings.recipient_emails || "",
      webhookSecret: newSettings.webhook_secret || "",
      instagramWebhook: newSettings.instagram_webhook || "",
      linkedinWebhook: newSettings.linkedin_webhook || ""
    };

    return Response.json({ success: true, settings: mapped });
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return Response.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
