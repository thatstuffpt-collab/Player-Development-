"use client";

import { firebaseAuth } from "@/lib/firebase/client";

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not signed in.");

  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}
