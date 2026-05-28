import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "PostSathi <noreply@postsathi.io>";

export interface PostPublishedEmailData {
  to:        string;
  userName:  string;
  platforms: string[];
  caption:   string;
  postId:    string;
}

export interface PostFailedEmailData {
  to:           string;
  userName:     string;
  platforms:    string[];
  caption:      string;
  failureReason: string;
}

export async function sendPostPublishedEmail(data: PostPublishedEmailData) {
  if (!resend) return; // Resend not configured — skip silently

  const platformList = data.platforms.join(", ");
  const preview      = data.caption.slice(0, 120) + (data.caption.length > 120 ? "…" : "");

  await resend.emails.send({
    from:    FROM,
    to:      data.to,
    subject: `✅ Your post went live on ${platformList}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#169B7F;margin-bottom:4px">Post published!</h2>
        <p style="color:#555;margin-top:0">Hi ${data.userName}, your scheduled post just went live.</p>
        <div style="background:#f4f9fa;border-left:4px solid #169B7F;padding:12px 16px;border-radius:4px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#333">${preview}</p>
        </div>
        <p style="color:#555;font-size:14px">Published to: <strong>${platformList}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/history"
           style="display:inline-block;background:#169B7F;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">
          View in History
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">PostSathi · Unsubscribe</p>
      </div>
    `,
  });
}

export async function sendPostFailedEmail(data: PostFailedEmailData) {
  if (!resend) return;

  const platformList = data.platforms.join(", ");
  const preview      = data.caption.slice(0, 120) + (data.caption.length > 120 ? "…" : "");

  await resend.emails.send({
    from:    FROM,
    to:      data.to,
    subject: `⚠️ Scheduled post failed on ${platformList}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#e53e3e;margin-bottom:4px">Post failed to publish</h2>
        <p style="color:#555;margin-top:0">Hi ${data.userName}, a scheduled post couldn't be published.</p>
        <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:12px 16px;border-radius:4px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#333">${preview}</p>
        </div>
        <p style="color:#555;font-size:14px">Attempted platforms: <strong>${platformList}</strong></p>
        <p style="color:#555;font-size:14px">Reason: <code style="background:#f0f0f0;padding:2px 6px;border-radius:3px">${data.failureReason}</code></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/generate"
           style="display:inline-block;background:#169B7F;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">
          Create a new post
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">PostSathi · Unsubscribe</p>
      </div>
    `,
  });
}
