"use client";

import { useState } from "react";
import Link from "next/link";
import { HamburgerMenu } from "iconsax-reactjs";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavLink } from "../content";

/** Menu button + side sheet with the nav links, shown below `lg`. */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Open menu" className="ml-auto lg:hidden">
          <HamburgerMenu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="px-5 pt-5 pb-6">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <Logo />
        <nav aria-label="Main" className="mt-4 flex flex-col">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base text-foreground outline-none hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Button asChild variant="outline" size="lp-md">
            <Link href="/sign-in" onClick={close}>
              Sign in
            </Link>
          </Button>
          <Button asChild variant="tonal" size="lp-md">
            <Link href="/register" onClick={close}>
              Start free
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
