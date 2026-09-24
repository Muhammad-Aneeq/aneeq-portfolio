"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import portrait from "@/assets/aneeq-portrait.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { ASK_ENABLED } from "@/lib/features";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-navigation sticky top-0 z-50 border-b border-border bg-[var(--scrim)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-(--container-page) items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="site-brand font-display text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap"
        >
          {/*
            `alt=""`, deliberately. The portrait sits immediately before the name in the
            same link, so describing it would make a screen reader announce the person
            twice. It is decoration next to the text that already names him.

            Imported, not referenced by path. A static import makes Next emit the file
            under a content-hashed name, so replacing the photograph changes the URL and
            no browser can serve a stale copy. Served from /public under a fixed path it
            did exactly that twice: the bytes changed, the URL did not, and the old face
            kept appearing until a hard refresh.
          */}
          <Image
            src={portrait}
            alt=""
            sizes="32px"
            priority
            className="brand-mark"
          />
          {site.name}
          <span className="ml-2 hidden text-muted xl:inline" data-readout>
            {site.role.toLowerCase()}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                // `px-2` until `lg`. The bar turns from a burger into six links at
                // 768px, and at that exact width six items plus the brand and the
                // Contact button overflowed the viewport by 21px. Tightening the
                // horizontal padding buys 48px back, which keeps the full bar at tablet
                // width rather than pushing tablets onto the mobile menu.
                "rounded-md px-2 py-2 text-sm transition-colors duration-200 lg:px-3",
                isActive(item.href) ? "text-text" : "text-muted hover:text-text",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {ASK_ENABLED && (
            <Link
              href="/ask"
              className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors duration-200 hover:border-border-strong hover:text-text sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-muted" aria-hidden />
              Ask this portfolio
            </Link>
          )}

          <Link href="/contact" className="site-contact hidden md:inline-flex">Contact <span aria-hidden>&#8599;</span></Link>
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-md border border-border text-muted md:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-border bg-surface px-5 py-3 md:hidden"
        >
          {[
            ...nav,
            { href: "/contact", label: "Contact" },
            ...(ASK_ENABLED ? [{ href: "/ask", label: "Ask this portfolio" }] : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // Closing here rather than in an effect on `pathname`: navigation is an
              // event, so handling it as one avoids a cascading render. Also covers
              // taps on the current route, which would not fire a pathname change.
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "block rounded-md px-2 py-2.5 text-[0.9375rem]",
                isActive(item.href) ? "text-text" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
