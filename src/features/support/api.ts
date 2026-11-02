// Data access for contact support. Mock now, Spring later.
import { delay } from "@/lib/api/delay";
import { faqItems, supportTopics } from "@/mocks/support";
import type { FaqItem, SupportMessage, SupportTopic } from "./types";

const globalForStore = globalThis as typeof globalThis & { __wbSupport?: SupportMessage[] };
const sent: SupportMessage[] = (globalForStore.__wbSupport ??= []);

export async function listTopics(): Promise<SupportTopic[]> {
  return supportTopics;
}

export async function listFaq(): Promise<FaqItem[]> {
  return faqItems;
}

export async function sendSupportMessage(
  body: Omit<SupportMessage, "id" | "ticket" | "createdAt">,
): Promise<SupportMessage> {
  await delay(500);
  const message: SupportMessage = {
    ...body,
    id: crypto.randomUUID(),
    ticket: `WB-${20481 + sent.length}`,
    createdAt: new Date().toISOString(),
  };
  sent.push(message);
  return message;
}
