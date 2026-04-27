/**
 * Abstraction layer for Calendar Providers (Google, Calendly)
 */
export interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

export interface CalendarProvider {
  name: string;
  getAvailability(coachId: string, start: Date, end: Date): Promise<CalendarEvent[]>;
  syncEvent(event: CalendarEvent): Promise<void>;
}

/**
 * Abstraction layer for Meeting Providers (Zoom, Google Meet)
 */
export interface MeetingDetails {
  url: string;
  externalId: string;
  provider: "zoom" | "google_meet";
}

export interface MeetingProvider {
  name: string;
  createMeeting(title: string, start: Date, duration: number): Promise<MeetingDetails>;
}

/**
 * Abstraction layer for Email Service (Resend)
 */
export interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }>;
}
