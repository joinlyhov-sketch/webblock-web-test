// Static marketing copy for the landing page. Not API data, so no mock and no DTO shape.

export type NavLink = { label: string; href: string };

/** Opens the "Talk to us" contact form (`ContactDialog`) on any landing, privacy or terms page. */
export const CONTACT_HASH = "#contact-form";

/** Home-page anchors, prefixed with `/` so they also work from /privacy and /terms. Section ids live on the section components. */
export const navLinks: NavLink[] = [
  { label: "Templates", href: "/#templates" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: CONTACT_HASH },
];

export type FaqItem = { question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    question: "Can customers order or pay on my site?",
    answer:
      "No. Every button is a call, an email or a map route — there is no shop or payment to manage.",
  },
  {
    question: "Do I need a developer?",
    answer:
      "No. Pick a template, fill in your details and deploy. If you can fill in a form, you can build your site.",
  },
  {
    question: "What happens after the 14-day trial?",
    answer:
      "Choose a plan to keep your website online. If you don't, it goes offline but your content is kept, so you can pick up where you left off.",
  },
  {
    question: "What will my website’s address be?",
    answer:
      "Every website gets a free address on webblock.com, like kilncoffee.webblock.com, with SSL included. You choose the name when you first deploy.",
  },
  {
    question: "Can I change my website after it's live?",
    answer:
      "Yes. Edit anything in the editor and redeploy — your changes go live in a few minutes.",
  },
];

export type FooterColumn = { title: string; links: NavLink[] };

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Templates", href: "/#templates" },
      { label: "Blocks", href: "/#blocks" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Email support", href: CONTACT_HASH },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];
