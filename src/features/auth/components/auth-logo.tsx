import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { siteConfig } from "@/config/site";

export function AuthLogo() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className="inline-flex self-start max-lg:self-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <Logo />
    </Link>
  );
}
