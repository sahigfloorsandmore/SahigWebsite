import { supabase } from "@/lib/supabase";

// Submit Lead
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, service, contactMethod, message } = body;

    if (!name || !email || !phone || !service) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone,
        service,
        contact_method: contactMethod,
        message,
        status: "New"
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Email Dispatch via Resend HTTP API
    let recipientEmails = process.env.LEAD_RECIPIENT_EMAILS || "admin@sahig.ca";
    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "config")
        .single();
      if (settings && settings.recipient_emails) {
        recipientEmails = settings.recipient_emails;
      }
    } catch (e) {
      // Settings query failed, fallback to env variable
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const recipientsList = recipientEmails.split(",").map(e => e.trim());
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Sahig Website <onboarding@resend.dev>",
            to: recipientsList,
            subject: `New Lead: ${name} - ${service}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="background-color: #141414; padding: 20px; text-align: center;">
                  <h1 style="color: #c48b5e; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">SAHIG</h1>
                  <span style="color: #888; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Estimate Request Alert</span>
                </div>
                <div style="padding: 30px;">
                  <h2 style="color: #141414; margin-top: 0; font-size: 20px; font-weight: 500;">New Project Lead</h2>
                  <p>A visitor has submitted a request for a free project estimate:</p>
                  
                  <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 160px;">Name</td>
                      <td style="padding: 10px; border: 1px solid #eee;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email</td>
                      <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${email}" style="color: #c48b5e; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone</td>
                      <td style="padding: 10px; border: 1px solid #eee;"><a href="tel:${phone}" style="color: #c48b5e; text-decoration: none;">${phone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Service Needed</td>
                      <td style="padding: 10px; border: 1px solid #eee;">${service}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Contact Preference</td>
                      <td style="padding: 10px; border: 1px solid #eee;">${contactMethod}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; vertical-align: top;">Project Details</td>
                      <td style="padding: 10px; border: 1px solid #eee; white-space: pre-line;">${message || "No project details provided."}</td>
                    </tr>
                  </table>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${req.nextUrl.origin}/admin/leads" style="background-color: #c48b5e; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; display: inline-block;">
                      Open Admin Dashboard
                    </a>
                  </div>
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee;">
                  &copy; ${new Date().getFullYear()} Sahig Floors and More Ltd. Database Backup Enabled.
                </div>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const emailErr = await emailResponse.json();
          console.error("Resend API Error details:", emailErr);
        }
      } catch (err) {
        console.error("Resend Email Alert Dispatch failed:", err);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("API POST Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Fetch Leads
export async function GET(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = leads.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      service: l.service,
      contactMethod: l.contact_method,
      message: l.message,
      status: l.status,
      createdAt: l.created_at
    }));

    return Response.json(mapped);
  } catch (error) {
    console.error("API GET Error:", error);
    return Response.json({ message: "Failed to read database records" }, { status: 500 });
  }
}

// Update Lead Status
export async function PUT(req) {
  try {
    const passwordHeader = req.headers.get("x-admin-password");
    const configuredPassword = process.env.ADMIN_PASSWORD || "sahigadmin";

    if (passwordHeader !== configuredPassword) {
      return Response.json({ message: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ message: "Missing lead ID or status" }, { status: 400 });
    }

    const { data: updatedLead, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const mapped = {
      id: updatedLead.id,
      name: updatedLead.name,
      email: updatedLead.email,
      phone: updatedLead.phone,
      service: updatedLead.service,
      contactMethod: updatedLead.contact_method,
      message: updatedLead.message,
      status: updatedLead.status,
      createdAt: updatedLead.created_at
    };

    return Response.json({ success: true, lead: mapped });
  } catch (error) {
    console.error("API PUT Error:", error);
    return Response.json({ message: "Failed to update lead records" }, { status: 500 });
  }
}
