import { mockApi, mockCollection } from "@/lib/mock-state";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { plans } from "@/mocks/plans";
import type { ContactMessage, Plan } from "./types";

/** Public plan list for the pricing section, cheapest first. Spring: `GET /plans`. */
export const listPublicPlans = mockApi(async function listPublicPlans(): Promise<Page<Plan>> {
  await delay(250);
  return { items: plans, page: 0, size: plans.length, totalItems: plans.length };
});

const received: ContactMessage[] = mockCollection("contact", []);

/**
 * Sends a contact-form message. Spring: `POST /contact` (public). The backend stores it and emails
 * support; the demo persists it without sending email.
 */
export const sendContactMessage = mockApi(async function sendContactMessage(
  body: Pick<ContactMessage, "name" | "email" | "message">,
): Promise<ContactMessage> {
  await delay(400);
  const message: ContactMessage = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  received.push(message);
  return message;
});
