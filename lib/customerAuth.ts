export async function hasCustomerSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/backend/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function requireCustomerSession(): Promise<boolean> {
  const signedIn = await hasCustomerSession();
  if (!signedIn && typeof window !== "undefined") window.location.assign("/signup");
  return signedIn;
}
