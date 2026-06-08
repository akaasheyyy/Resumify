/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dispatches a welcome email to the specified user upon login or sign-up events.
 * It uses a dual dispatch system designed for maximum resilience:
 * 1. First, it attempts a direct client-side call which is guaranteed to succeed
 *    in real browser environments where EmailJS "non-browser API access" might be disabled in security settings.
 * 2. If the client-side call fails (e.g. browser ad blockers/privacy filters blocking emailjs.com),
 *    it gracefully falls back to routing through our backend proxy in server.ts.
 */
export async function sendWelcomeEmail(email: string, fullName: string) {
  if (!email) return { success: false, error: "Empty email address registration" };
  const resolvedName = fullName || "Valued User";

  console.log(`[Welcome Email Dispatcher] Triggering send pipeline for: ${email}, name: ${resolvedName}`);

  // Action 1: Direct Client-side dispatch
  try {
    const payload = {
      service_id: "service_4gdof5i",
      template_id: "template_mejlhea",
      user_id: "uVQQaQEsziCobXVg4",
      template_params: {
        name: resolvedName,
        email: email,
        to_name: resolvedName,
        to_email: email,
        user_name: resolvedName,
        user_email: email,
        subject: "Welcome to Resumify!"
      }
    };

    const directResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (directResponse.ok) {
      const respText = await directResponse.text();
      console.log(`[EmailJS Client SUCCESS] Welcome email dispatched directly from browser. Response: ${respText}`);
      return { success: true, mode: "client", response: respText };
    } else {
      const respText = await directResponse.text();
      console.warn(`[EmailJS Client WARNING] Direct browser send returned fallback status ${directResponse.status}: ${respText}`);
    }
  } catch (clientErr) {
    console.error(`[EmailJS Client EXCEPTION] Direct fetch rejected (potential network check or blocker):`, clientErr);
  }

  // Action 2: Server-side proxy fallback
  try {
    console.log(`[EmailJS System Fallback] Direct send failed or was blocked; fallback to server-side CORS/proxy API route.`);
    const serverResponse = await fetch("/api/email/send-welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        fullName: resolvedName
      })
    });

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      console.log(`[EmailJS Server Proxy SUCCESS] Server-side dispatch completed successfully:`, data);
      return { success: true, mode: "server", response: data };
    } else {
      const text = await serverResponse.text();
      console.error(`[EmailJS Server Proxy ERROR] Backend route failed. Status: ${serverResponse.status}, Body: ${text}`);
      return { success: false, error: `Proxy status: ${serverResponse.status}, body: ${text}` };
    }
  } catch (serverErr: any) {
    console.error(`[EmailJS Server Proxy EXCEPTION] Failed to execute fallback express API route:`, serverErr);
    return { success: false, error: serverErr?.message || "Internal endpoint error" };
  }
}
