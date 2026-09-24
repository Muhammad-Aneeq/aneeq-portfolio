import type { Metadata, Viewport } from "next";
import { PersonJsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { NavigationMemory } from "@/components/navigation-memory";
import { ThemeProvider } from "@/components/theme-provider";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import "./globals.css";
import "./workbench.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}. ${site.role}`,
    template: `%s. ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "profile",
    siteName: site.name,
    title: `${site.name}. ${site.role}`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Browser chrome follows the same palette as globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141821" },
    { media: "(prefers-color-scheme: light)", color: "#eef1f7" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={fontVariables}
    >
      <head>
        {/* Resolve the stored or system theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html:
          `document.documentElement.classList.add('js');` +
          `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}` +
          `if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}` +
          `document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;})();`,
        }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2.5 focus:text-sm"
          >
            Skip to content
          </a>

          <NavigationMemory />
          <SiteNav />
          <main id="main">{children}</main>
          <SiteFooter />

        </ThemeProvider>
        <PersonJsonLd />
      </body>
    </html>
  );
}
