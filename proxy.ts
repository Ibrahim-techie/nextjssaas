import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Pages anyone can open. Signed-in users are sent to /home instead. */
const GUEST_PAGES = ["/", "/sign-in", "/sign-up"];

/** API routes that authenticate themselves (signatures, not sessions). */
const PUBLIC_API_PREFIXES = ["/api/public/", "/api/webhooks/"];

function isGuestPage(pathname: string) {
  return GUEST_PAGES.some(
    (page) =>
      pathname === page || (page !== "/" && pathname.startsWith(`${page}/`)),
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  const { userId } = await auth();
  const guestPage = isGuestPage(pathname);

  if (userId && guestPage) {
    return NextResponse.redirect(new URL("/home", req.url), 307);
  }

  if (!userId && !guestPage) {
    if (pathname.startsWith("/api/") || pathname.startsWith("/trpc/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url), 307);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
