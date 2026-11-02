import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { navLinks } from "../content";
import { MobileNav } from "./mobile-nav";

/** Floating pill nav (Figma "LP/Header"). Links collapse into a sheet below `lg`. */
export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-4 sm:top-6 sm:px-6">
      <div className="mx-auto flex max-w-[1080px] items-center gap-6 rounded-full border border-border bg-background py-2 pr-2 pl-5 shadow-float sm:pl-6">
        <Link href="/" aria-label="WebBlock home" className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3 py-2.5 text-base text-foreground outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:ml-0 lg:flex">
          <Button asChild variant="outline" size="lp-md">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="tonal" size="lp-md">
            <Link href="/register">Start free</Link>
          </Button>
        </div>

        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
