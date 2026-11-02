// Static copy for /privacy and /terms. Not API data, so no mock and no DTO shape.

export type LegalItem = { label?: string; text: string };

export type LegalSection = {
  /** Anchor id, also used by the "On this page" list. */
  id: string;
  heading: string;
  paragraphs: string[];
  items?: LegalItem[];
};

export type LegalDocument = {
  title: string;
  /** ISO-8601 date the text last changed. */
  updatedAt: string;
  summary: string;
  sections: LegalSection[];
  /** The other legal page, linked under the text. */
  related: { label: string; href: string };
};

export const privacyPolicy: LegalDocument = {
  title: "Privacy policy",
  updatedAt: "2026-10-29T00:00:00Z",
  summary:
    "This policy explains what WebBlock collects when you use webblock.com and the WebBlock editor, why we collect it, and the choices you have. “WebBlock”, “we” and “us” mean the WebBlock team in Phnom Penh, Cambodia.",
  sections: [
    {
      id: "what-we-collect",
      heading: "What we collect",
      paragraphs: ["We only collect what we need to build, publish and look after your website."],
      items: [
        {
          label: "Account details",
          text: "Your name, email address and password (stored only as a secure hash). If you sign in with Google, we receive your name, email address and profile photo from Google.",
        },
        {
          label: "Website content",
          text: "Everything you add to your site: business name, description, address, phone number, opening hours, logo, images, products and prices.",
        },
        {
          label: "Billing records",
          text: "Your plan, and the amount, date and status of each subscription payment. You pay by scanning a KHQR code in your own banking app, so we never see or store your bank account or card details.",
        },
        {
          label: "Usage and technical data",
          text: "Deploy history, changes made in your account, your IP address, browser type and the logs we need to run, secure and monitor the service.",
        },
        {
          label: "Support messages",
          text: "What you send us when you email support, so we can answer you.",
        },
      ],
    },
    {
      id: "how-we-use-it",
      heading: "How we use it",
      paragraphs: [
        "We do not sell your data and we do not show you advertising. We use your information to:",
      ],
      items: [
        { text: "build, host and publish your website, and keep it online;" },
        { text: "verify your email address with one-time codes and keep your account secure;" },
        { text: "manage your free trial and subscription;" },
        {
          text: "send emails about your account, such as verification codes, trial reminders, payment confirmations and failed deploys;",
        },
        { text: "prevent abuse, fraud and attacks on the service;" },
        { text: "understand how WebBlock is used so we can improve it." },
      ],
    },
    {
      id: "site-visitors",
      heading: "Visitors to websites built with WebBlock",
      paragraphs: [
        "Websites built with WebBlock are showcase sites. They don't sell online or take payments, and they have no forms that collect visitor details. When a visitor calls, emails or gets directions to a business, that happens directly between them and the business, outside WebBlock.",
        "To keep these websites online and secure we keep standard server logs (IP address, time and page requested). Each business is responsible for the content it publishes on its own website.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      paragraphs: [
        "We use only the cookies needed to keep you signed in and to protect your account. We do not use advertising or cross-site tracking cookies.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      paragraphs: ["We share information only when it is needed to run WebBlock:"],
      items: [
        {
          label: "Service providers",
          text: "Companies that host our servers, deliver our emails, process KHQR payments (WeBill365) and provide Google sign-in. They receive only what they need for that job.",
        },
        {
          label: "The law",
          text: "When we are required to by law, or to protect the rights and safety of our users and the public.",
        },
        {
          label: "A change of ownership",
          text: "If WebBlock is merged or sold, your information would move to the new owner under this same policy.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      paragraphs: [
        "We keep your account and website content while your account is open. If your trial ends or your subscription lapses, your website goes offline but your content is kept, so you can pick up where you left off.",
        "If you ask us to delete your account, we delete your account and website content within 30 days. We keep billing records for as long as the law requires.",
      ],
    },
    {
      id: "security",
      heading: "Security",
      paragraphs: [
        "Every website and the WebBlock platform are served over HTTPS. Passwords are stored as secure hashes, and only the people who need it to run the service can access your data. No system is perfectly secure, so please use a strong password and keep it to yourself.",
      ],
    },
    {
      id: "your-choices",
      heading: "Your choices",
      paragraphs: [
        "You can see and update your profile and business details at any time in your account settings. To get a copy of your data, correct something you can't change yourself, or delete your account, email us and we will reply within 14 days.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      paragraphs: [
        "WebBlock is a tool for businesses and is not meant for children. We do not knowingly collect information from anyone under 18.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: [
        "When we change this policy we update the date at the top. If a change is significant, we will also email you before it takes effect.",
      ],
    },
  ],
  related: { label: "Terms of service", href: "/terms" },
};

export const termsOfService: LegalDocument = {
  title: "Terms of service",
  updatedAt: "2026-10-29T00:00:00Z",
  summary:
    "These terms are the agreement between you and WebBlock when you use webblock.com, the WebBlock editor and the websites you publish with it. By creating an account you agree to them, so please read them.",
  sections: [
    {
      id: "the-service",
      heading: "The service",
      paragraphs: [
        "WebBlock lets you build a showcase website for your business from a template, edit it with blocks and publish it. Your website shows your information and lets visitors reach you by phone, email, map directions or links to other sites.",
        "WebBlock websites don't sell online or take payments from visitors, and you agree not to try to add that.",
      ],
    },
    {
      id: "your-account",
      heading: "Your account",
      paragraphs: [],
      items: [
        { text: "You must be at least 18, or have the authority to act for the business you sign up for." },
        { text: "Give us accurate information and keep it up to date." },
        { text: "Keep your password safe. You are responsible for everything done with your account." },
        { text: "Tell us straight away if you think someone else has access to your account." },
      ],
    },
    {
      id: "trial-and-plans",
      heading: "Free trial and plans",
      paragraphs: [
        "Every account starts with a 14-day free trial. No payment is needed for the trial.",
        "To keep your website online after the trial, choose a paid plan. Plans are billed monthly in advance and paid by KHQR. Prices and each plan's limits (websites, products and redeploys a month) are shown on our pricing page.",
        "You can cancel at any time. Your plan stays active until the end of the month you have paid for, and we do not refund partial months unless the law requires it. If you don't renew, your website goes offline but your content is kept.",
        "If we change a plan's price, we will email you at least 30 days before the new price applies to you.",
      ],
    },
    {
      id: "your-content",
      heading: "Your content",
      paragraphs: [
        "You own the content you add to WebBlock: your text, images, logo, products and prices. You give us permission to store, process and display it only so we can run your website and the service.",
        "You are responsible for your content. Make sure it is accurate and legal, and that you have the right to use every image, logo and text you publish.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      paragraphs: ["You agree not to use WebBlock to:"],
      items: [
        { text: "break the law, or promote illegal goods or services;" },
        { text: "mislead people, impersonate another person or business, or run scams or phishing;" },
        { text: "publish hateful, violent, sexual or harassing content;" },
        { text: "use content that infringes someone else's copyright, trademark or privacy;" },
        { text: "collect payment or personal details from visitors through your website;" },
        { text: "spread malware, attack or overload the service, or try to get around plan limits;" },
        { text: "resell or rebrand WebBlock without our written permission." },
      ],
    },
    {
      id: "domains",
      heading: "Your web address",
      paragraphs: [
        "Every website is deployed on a free webblock.com address (for example yourbusiness.webblock.com), with SSL included. You choose the name, and it must be one nobody else is using.",
        "The address belongs to WebBlock and is yours to use while your account is open. We may change an address that is misleading or uses someone else's name or trademark, and we will tell you if we do.",
      ],
    },
    {
      id: "availability",
      heading: "Availability",
      paragraphs: [
        "We monitor every website and work to keep it online, but we can't promise the service will never be interrupted. We may pause it briefly for maintenance and will try to do so at quiet times.",
      ],
    },
    {
      id: "our-property",
      heading: "Our property",
      paragraphs: [
        "The WebBlock platform, editor, templates and brand belong to WebBlock. You may use the templates for the websites you build on WebBlock, but not copy them for use elsewhere.",
      ],
    },
    {
      id: "ending",
      heading: "Suspension and closing your account",
      paragraphs: [
        "You can stop using WebBlock and ask us to delete your account at any time.",
        "We may remove content, take a website offline or suspend an account that breaks these terms. Where we can, we will tell you why first and give you a chance to fix it.",
      ],
    },
    {
      id: "liability",
      heading: "Disclaimers and liability",
      paragraphs: [
        "WebBlock is provided “as is”. As far as the law allows, we are not liable for indirect losses such as lost profits, lost business or lost data, and our total liability to you is limited to what you paid us in the three months before the claim.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      paragraphs: [
        "We may update these terms as WebBlock grows. We will update the date at the top, and email you before significant changes take effect. If you keep using WebBlock after that, you accept the new terms.",
      ],
    },
    {
      id: "law",
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the Kingdom of Cambodia. Any dispute will be handled by the courts of Phnom Penh.",
      ],
    },
  ],
  related: { label: "Privacy policy", href: "/privacy" },
};
