import { Resend } from "resend";
import { EmailProvider, EmailPayload } from "./providers";

const resendApiKey = (import.meta as any).env.VITE_RESEND_API_KEY;
const emailFrom = (import.meta as any).env.VITE_EMAIL_FROM || "Connect+ <notifications@connectplus.app>";

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend | null = null;

  constructor() {
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
    if (!this.resend) {
      console.warn("Resend API Key missing. Skipping email:", payload);
      return { success: false };
    }

    try {
      // In a real app, you'd use actual templates (HTML/React)
      // Here we simulate with a simple text-based mapping for the MVP
      const { data, error } = await this.resend.emails.send({
        from: emailFrom,
        to: payload.to,
        subject: payload.subject,
        text: `Message: ${payload.template}\nData: ${JSON.stringify(payload.data, null, 2)}`,
      });

      if (error) throw error;
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("Failed to send email:", err);
      return { success: false };
    }
  }
}

export const emailService = new ResendEmailProvider();
