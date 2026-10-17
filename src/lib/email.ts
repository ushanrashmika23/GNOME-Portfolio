import nodemailer from 'nodemailer';

interface SendOtpEmailOptions {
  to: string;
  code: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(host: string, port: number, user: string, pass: string) {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });
  }
  return cachedTransporter;
}

export async function sendOtpEmail({ to, code }: SendOtpEmailOptions): Promise<{ success: boolean; message: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"GNOME Portfolio Security" <noreply@portfolio.ushanrashmika.me>`;

  console.log(`[AUTH] Dispatching verification code to ${to}...`);

  if (host && user && pass) {
    try {
      const transporter = getTransporter(host, port, user, pass);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f1420; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #e01b24; display: inline-block; margin-right: 4px;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #f6d32d; display: inline-block; margin-right: 4px;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #33d17a; display: inline-block;"></div>
            <span style="font-size: 12px; color: #64748b; font-family: monospace; margin-left: 8px;">gnome-admin-auth</span>
          </div>
          <h2 style="margin-top: 0; color: #3584e4; font-size: 20px; font-weight: 700;">Admin Verification Code</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Use the following one-time code to sign in to your GNOME Portfolio management portal.</p>
          <div style="background: rgba(53, 132, 228, 0.12); border: 1px solid rgba(53, 132, 228, 0.35); border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0; line-height: 1.5;">This verification code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `;

      await transporter.sendMail({
        from,
        to,
        subject: `Your GNOME Portfolio Admin Code: ${code}`,
        text: `Your GNOME Portfolio login verification code is: ${code}. This code expires in 15 minutes.`,
        html,
      });

      console.log(`[AUTH] Verification email delivered to ${to}`);
      return {
        success: true,
        message: `Verification code sent to ${to}`,
      };
    } catch (error: any) {
      console.error('Failed to send email via SMTP:', error.message || error);
      return {
        success: false,
        message: `Failed to deliver email. Please check your SMTP configuration in .env`,
      };
    }
  }

  return {
    success: false,
    message: `SMTP credentials not configured in .env. Please configure SMTP_USER and SMTP_PASS.`,
  };
}

interface SendContactEmailOptions {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({ name, email, message }: SendContactEmailOptions): Promise<{ success: boolean; message: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const adminEmail = process.env.MANAGE_ADMIN_EMAIL || 'ushanrashmika23@gmail.com';
  const from = process.env.SMTP_FROM || `"GNOME Portfolio Contact" <noreply@portfolio.ushanrashmika.me>`;

  console.log(`[CONTACT EMAIL] Dispatching portfolio inquiry from ${name} (${email}) to ${adminEmail}...`);

  if (host && user && pass) {
    try {
      const transporter = getTransporter(host, port, user, pass);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f1420; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #e01b24; display: inline-block; margin-right: 4px;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #f6d32d; display: inline-block; margin-right: 4px;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #33d17a; display: inline-block;"></div>
            <span style="font-size: 12px; color: #64748b; font-family: monospace; margin-left: 8px;">gnome-portfolio-inquiry</span>
          </div>
          <h2 style="margin-top: 0; color: #3584e4; font-size: 20px; font-weight: 700;">New Contact Inquiry</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">You received a new message from your GNOME portfolio contact window.</p>
          
          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Sender Name</span>
              <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 2px;">${name}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Sender Email</span>
              <div style="font-size: 14px; font-family: monospace; color: #60a5fa; margin-top: 2px;">
                <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a>
              </div>
            </div>
            <div>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Message</span>
              <div style="font-size: 14px; line-height: 1.6; color: #e2e8f0; margin-top: 4px; white-space: pre-wrap; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 6px;">${message}</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${email}?subject=Re: Your inquiry on GNOME Portfolio" style="display: inline-block; background: #3584e4; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px; margin-bottom: 0;">Also saved to Cloudflare D1 database.</p>
        </div>
      `;

      await transporter.sendMail({
        from,
        to: adminEmail,
        replyTo: email,
        subject: `New Inquiry from ${name} - GNOME Portfolio`,
        text: `From: ${name} (${email})\n\nMessage:\n${message}`,
        html,
      });

      console.log(`[CONTACT EMAIL] Inquiry email delivered to ${adminEmail}`);
      return { success: true, message: 'Message sent and notification delivered.' };
    } catch (error: any) {
      console.error('Failed to send contact notification email:', error.message || error);
      return { success: false, message: error.message };
    }
  }

  return { success: false, message: 'SMTP not configured' };
}

