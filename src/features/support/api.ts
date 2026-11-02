import { mockApi, mockCollection } from "@/lib/mock-state";
// Data access for contact support. Mock now, Spring later.
import { delay } from "@/lib/api/delay";
import { faqItems, supportTopics } from "@/mocks/support";
import type { FaqItem, SupportMessage, SupportTopic } from "./types";

const sent: SupportMessage[] = mockCollection("support", []);

export const listTopics = mockApi(async function listTopics(): Promise<SupportTopic[]> {
  return supportTopics;
});

export const listFaq = mockApi(async function listFaq(): Promise<FaqItem[]> {
  return faqItems;
});

export const sendSupportMessage = mockApi(async function sendSupportMessage(
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
});
