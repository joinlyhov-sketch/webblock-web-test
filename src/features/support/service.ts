import { mockApi } from "@/lib/mock-state";
import type { ActionResult } from "@/lib/actions/result";
import { getProfile } from "@/features/account/api";
import { listFaq, listTopics, sendSupportMessage } from "./api";
import { listWebsites } from "@/features/websites/api";
import { ApiError } from "@/lib/api/errors";
import { createCollector, formText } from "@/lib/validation/fields";
import { SUPPORT_LIMITS } from "./schemas";
import type { FaqItem, SupportTopic } from "./types";

export type SupportView = {
  email: string;
  websites: { id: string; name: string }[];
  topics: SupportTopic[];
  faq: FaqItem[];
};

export const getSupportView = mockApi(async function getSupportView(userId: string): Promise<SupportView> {
  const [profile, websites, topics, faq] = await Promise.all([
    getProfile(userId),
    listWebsites(userId),
    listTopics(),
    listFaq(),
  ]);
  return {
    email: profile.email,
    websites: websites.items.map((w) => ({ id: w.id, name: w.name })),
    topics,
    faq,
  };
});

export type SupportReceipt = {
  ticket: string;
  email: string;
  subject: string;
  topic: string;
  website: string | null;
};

export const submitSupport = mockApi(async function submitSupport(
  userId: string,
  formData: FormData,
): Promise<ActionResult<SupportReceipt>> {
  const values = {
    site: formText(formData, "site"),
    topic: formText(formData, "topic"),
    subject: formText(formData, "subject"),
    message: formText(formData, "message"),
  };

  const c = createCollector();
  c.text("subject", values.subject, "Subject", { min: 3, max: SUPPORT_LIMITS.subject });
  c.text("message", values.message, "Message", { min: 10, max: SUPPORT_LIMITS.message });
  if (!values.topic) c.add("topic", "Pick a topic.");
  if (c.hasErrors) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: c.errors, values };
  }

  try {
    const [profile, websites, topics] = await Promise.all([
      getProfile(userId),
      listWebsites(userId),
      listTopics(),
    ]);
    const website = websites.items.find((w) => w.id === values.site);
    const topic = topics.find((t) => t.id === values.topic);
    const sent = await sendSupportMessage({
      from: profile.email,
      website: website?.name ?? null,
      topic: topic?.label ?? values.topic,
      subject: values.subject,
      message: values.message,
    });
    return {
      ok: true,
      data: {
        ticket: sent.ticket,
        email: profile.email,
        subject: sent.subject,
        topic: sent.topic,
        website: sent.website,
      },
      message: "Message sent",
    };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values };
    throw e;
  }
});
