import type { FaqItem, SupportTopic } from "@/features/support/types";

export const supportTopics: SupportTopic[] = [
  { id: "editing", label: "Editing my website" },
  { id: "publishing", label: "Publishing & deploys" },
  { id: "domain", label: "Domain" },
  { id: "billing", label: "Billing" },
  { id: "other", label: "Something else" },
];

export const faqItems: FaqItem[] = [
  {
    id: "change-after-live",
    question: "Can I change my website after it’s live?",
    answer:
      "Yes. Open the editor, make your changes and click Deploy. Your live site updates in a few minutes.",
  },
  {
    id: "own-domain",
    question: "What will my website’s address be?",
    answer:
      "Your website gets a free address on webblock.com, like yourbusiness.webblock.com, with SSL included. You choose the name when you first deploy.",
  },
  {
    id: "trial-ends",
    question: "What happens when my trial ends?",
    answer:
      "Your website stays safe, but it goes offline until you choose a plan. Pick a plan any time to bring it back online.",
  },
  {
    id: "phones",
    question: "Will it work on phones?",
    answer:
      "Every template adapts to phones, tablets and desktops. You can check each size in the editor preview.",
  },
  {
    id: "change-template",
    question: "How do I change my template?",
    answer:
      "Start a new website from the template you want, then copy your business details across. Your original website is not changed.",
  },
  {
    id: "deploy-time",
    question: "How long does a deploy take?",
    answer:
      "Most deploys finish in a few minutes. You can follow the progress on the deploy screen and we tell you if something needs attention.",
  },
  {
    id: "upgrade",
    question: "How do I upgrade my plan?",
    answer:
      "Go to Settings, open Billing and choose a plan. You can also use the View plans button in the sidebar.",
  },
];
