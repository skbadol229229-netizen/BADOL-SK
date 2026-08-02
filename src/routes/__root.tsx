import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/context/cart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { WhatsappButton } from "@/components/whatsapp-button";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { useSettings } from "@/hooks/use-store";
import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/hooks/use-theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="label-caps text-muted-foreground">Error 404</p>
        <h1 className="type-h1 mt-3">This page doesn't exist</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page may have moved, or the link is no longer valid.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-solid">
            Back to home
          </Link>
          <Link to="/shop" className="btn btn-outline">
            Shop all products
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="type-h1">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. Try again, or head back to the store.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-solid"
          >
            Try again
          </button>
          <a href="/" className="btn btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Trikon Clothing — Premium Menswear in Bangladesh" },
      {
        name: "description",
        content:
          "Trikon Clothing sells premium men's t-shirts, shirts, polos, shorts and boxers in Bangladesh with cash on delivery.",
      },
      { name: "author", content: "Trikon Clothing" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Keeps the browser tab title in sync with the store name saved in settings,
 * without touching each route's own head() metadata.
 */
function DynamicTitle() {
  const { storeName } = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof document === "undefined" || !storeName) return;
    const id = window.setTimeout(() => {
      document.title = document.title.replace(/Trikon/gi, storeName);
    }, 0);
    return () => window.clearTimeout(id);
  }, [storeName, pathname]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith("/admin"),
  });

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <DynamicFavicon />
        <Toaster position="top-center" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 pb-14 md:pb-0">
            {/* Required: nested routes render here. */}
            <Outlet />
          </main>
          <SiteFooter />
          <MobileBottomNav />
          <WhatsappButton />
          <DynamicTitle />
          <DynamicFavicon />
        </div>
        <Toaster position="top-center" />
      </CartProvider>
    </QueryClientProvider>
  );
}
