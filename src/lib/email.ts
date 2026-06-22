import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const FROM = "Sou9Car <noreply@sou9car.ma>";

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
  const link = `${baseUrl}/verify-email?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] Verification link for ${to}: ${link}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Vérifiez votre adresse email — Sou9Car",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;overflow:hidden;border:1px solid #222">
        <tr>
          <td style="padding:28px 40px;border-bottom:1px solid #222">
            <span style="font-size:22px;font-weight:700;color:#fff">Sou9<span style="color:#3b82f6">Car</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <h1 style="margin:0 0 12px;font-size:20px;color:#fff">Bonjour ${name} 👋</h1>
            <p style="margin:0 0 28px;color:#888;font-size:15px;line-height:1.6">
              Merci de vous être inscrit sur Sou9Car. Cliquez ci-dessous pour vérifier votre email et activer votre compte.
            </p>
            <a href="${link}" style="display:inline-block;padding:14px 32px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
              Vérifier mon email →
            </a>
            <p style="margin:28px 0 0;color:#555;font-size:13px;line-height:1.6">
              Ce lien expire dans <strong style="color:#777">24 heures</strong>.<br>
              Si vous n'avez pas créé de compte sur Sou9Car, ignorez cet email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #222">
            <p style="margin:0;color:#444;font-size:12px">© 2026 Sou9Car — La marketplace automobile du Maroc</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  });
}

export async function sendInspectionBookedEmail({
  ownerEmail,
  buyerName,
  listingTitle,
  location,
  scheduledAt,
  inspectionId,
}: {
  ownerEmail: string;
  buyerName: string;
  listingTitle: string;
  location: string;
  scheduledAt?: string;
  inspectionId: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Inspection booked:", { ownerEmail, buyerName, listingTitle });
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `📋 New inspection request — ${listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#f97316">New Inspection Request</h2>
        <p><strong>${buyerName}</strong> has booked an inspection for <strong>${listingTitle}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Location</td><td style="padding:8px;font-weight:bold">${location}</td></tr>
          ${scheduledAt ? `<tr><td style="padding:8px;color:#666">Preferred date</td><td style="padding:8px;font-weight:bold">${new Date(scheduledAt).toLocaleString("fr-MA")}</td></tr>` : ""}
          <tr><td style="padding:8px;color:#666">Inspection ID</td><td style="padding:8px;font-family:monospace">${inspectionId}</td></tr>
        </table>
        <a href="https://sou9car.ma/inspector" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          View in Dashboard
        </a>
        <p style="color:#999;margin-top:24px;font-size:13px">Sou9Car — Morocco's trusted car marketplace</p>
      </div>
    `,
  });
}

export async function sendInspectionConfirmedEmail({
  buyerEmail,
  listingTitle,
  inspectorName,
  scheduledAt,
  location,
}: {
  buyerEmail: string;
  listingTitle: string;
  inspectorName: string;
  scheduledAt?: string;
  location: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Inspection confirmed:", { buyerEmail, listingTitle });
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: buyerEmail,
    subject: `✅ Inspection confirmed — ${listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#10b981">Inspection Confirmed</h2>
        <p>Your inspection for <strong>${listingTitle}</strong> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Inspector</td><td style="padding:8px;font-weight:bold">${inspectorName}</td></tr>
          <tr><td style="padding:8px;color:#666">Location</td><td style="padding:8px;font-weight:bold">${location}</td></tr>
          ${scheduledAt ? `<tr><td style="padding:8px;color:#666">Date</td><td style="padding:8px;font-weight:bold">${new Date(scheduledAt).toLocaleString("fr-MA")}</td></tr>` : ""}
          <tr><td style="padding:8px;color:#666">Fee</td><td style="padding:8px;font-weight:bold">300 MAD (paid via PayPal ✅)</td></tr>
        </table>
        <p style="color:#999;margin-top:24px;font-size:13px">Sou9Car — Morocco's trusted car marketplace</p>
      </div>
    `,
  });
}

export async function sendAgentConversationEmail({
  summary,
  listingId,
}: {
  summary: string;
  listingId?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Agent conversation:", summary.slice(0, 100));
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL || "youcefboubkri@gmail.com",
    subject: "🤖 Sou9Bot conversation update",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#f97316">🤖 Sou9Bot Conversation</h2>
        ${listingId ? `<p>Related listing: <a href="https://sou9car.ma/listings/${listingId}">View listing</a></p>` : ""}
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;font-size:13px;white-space:pre-wrap">${summary}</pre>
        <p style="color:#999;margin-top:24px;font-size:13px">Sou9Car AI Agent</p>
      </div>
    `,
  });
}

export async function sendReservationRequestEmail({
  buyerName,
  buyerPhone,
  buyerEmail,
  listingTitle,
  listingCity,
  reservationId,
  expiresAt,
}: {
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string;
  listingTitle: string;
  listingCity: string;
  reservationId: string;
  expiresAt: Date;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "youcefboubkri@gmail.com";
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] New reservation request:", { buyerName, listingTitle, reservationId });
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `🔔 Nouvelle demande de réservation — ${listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#f97316">🔔 Nouvelle demande de disponibilité</h2>
        <p><strong>${buyerName}</strong> veut réserver <strong>${listingTitle}</strong> (${listingCity}).</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Acheteur</td><td style="padding:8px;font-weight:bold">${buyerName}</td></tr>
          <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${buyerEmail}</td></tr>
          ${buyerPhone ? `<tr><td style="padding:8px;color:#666">Téléphone</td><td style="padding:8px;font-weight:bold">${buyerPhone}</td></tr>` : ""}
          <tr><td style="padding:8px;color:#666">Véhicule</td><td style="padding:8px;font-weight:bold">${listingTitle} — ${listingCity}</td></tr>
          <tr><td style="padding:8px;color:#666">Expire à</td><td style="padding:8px;color:#f97316;font-weight:bold">${new Date(expiresAt).toLocaleString("fr-MA")}</td></tr>
          <tr><td style="padding:8px;color:#666">Référence</td><td style="padding:8px;font-family:monospace">${reservationId}</td></tr>
        </table>
        <a href="https://sou9car.ma/admin" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          Répondre dans l'admin →
        </a>
        <p style="color:#999;margin-top:24px;font-size:13px">Sou9Car — Répondez dans les 2 heures.</p>
      </div>
    `,
  });
}

export async function sendBoostConfirmedEmail({
  sellerEmail,
  listingTitle,
  plan,
  expiresAt,
}: {
  sellerEmail: string;
  listingTitle: string;
  plan: string;
  expiresAt: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Boost confirmed:", { sellerEmail, listingTitle });
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: sellerEmail,
    subject: `⚡ Your listing is now boosted — ${listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#f97316">⚡ Listing Boosted!</h2>
        <p><strong>${listingTitle}</strong> is now featured at the top of search results.</p>
        <p>Plan: <strong>${plan}</strong> · Active until <strong>${new Date(expiresAt).toLocaleDateString("fr-MA")}</strong></p>
        <p style="color:#999;margin-top:24px;font-size:13px">Sou9Car — Morocco's trusted car marketplace</p>
      </div>
    `,
  });
}
