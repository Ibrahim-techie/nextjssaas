"use client";

import { useAuth } from "@clerk/nextjs";

export default function TokenLogger() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  async function logToken() {
    const token = await getToken();
    console.log("Clerk session token:", token);
  }

  if (!isLoaded) return <p>Loading Clerk session…</p>;
  if (!isSignedIn) return <p>Sign in first.</p>;

  return (
    <button type="button" onClick={logToken}>
      Log Clerk token to console
    </button>
  );
}
