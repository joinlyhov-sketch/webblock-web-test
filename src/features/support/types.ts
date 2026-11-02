export type SupportTopic = {
  id: string;
  label: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SupportMessage = {
  id: string;
  /** Human-readable ticket number, e.g. "WB-20481". */
  ticket: string;
  from: string;
  /** Website the message is about, or `null` for a general question. */
  website: string | null;
  topic: string;
  subject: string;
  message: string;
  createdAt: string;
};
