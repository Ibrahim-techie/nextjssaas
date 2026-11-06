import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {

  const { userId } = await auth();

  const url = new URL(req.url);



  const apiRequest = url.pathname.startsWith("/api");

  const isPublicApiRequest =
    url.pathname === "/api/public" ||
    url.pathname.startsWith("/api/public/");

  // Public routes
  const isPublicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-otp",
    "/verify-phone",
    "/verify-webauthn",
    "/verify-totp",
    "/verify-sms",
    "/verify-email-otp",
    "/verify-email-link",
    "/contact",
  ];

  const isPublicPath =
    isPublicPaths.includes(url.pathname) ||
    ["/sign-in", "/sign-up"].some(
      (path) => url.pathname.startsWith(`${path}/`),
    );

  // 1. Logged-in user accessing guest routes
  if (
    userId &&
    isPublicPath &&
    url.pathname !== "/home"
  ) {
    return NextResponse.redirect(
      new URL("/home", req.url),
      307
    );
  }

  // 2. Guest accessing protected routes
  else if (
    !userId &&
    !isPublicPath &&
    !isPublicApiRequest
  ) {

    // API requests should receive 401, not a page redirect
    if (apiRequest) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL("/sign-in", req.url),
      307
    );
  }

});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
