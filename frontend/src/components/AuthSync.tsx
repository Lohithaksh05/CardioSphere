"use client";

import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { registerTokenProvider, syncUser } from "@/lib/api";

/**
 * Provider that registers a Clerk token provider with the Axios instance
 * and creates/updates the user in our MongoDB backend on sign-in.
 */
export default function AuthSync({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const synced = useRef(false);

  // Register token providers:
  //  - normal: uses Clerk's cache (fast)
  //  - fresh: forces a new token (used on 401 retries)
  useEffect(() => {
    registerTokenProvider(
      () => getToken(),
      () => getToken({ skipCache: true })
    );
  }, [getToken]);

  // Sync user record to our backend exactly once per sign-in
  useEffect(() => {
    if (!isSignedIn || !user || synced.current) return;

    async function sync() {
      try {
        await syncUser({
          clerk_id: user!.id,
          email: user!.primaryEmailAddress?.emailAddress || "",
          first_name: user!.firstName || "",
          last_name: user!.lastName || "",
          image_url: user!.imageUrl || "",
        });
        synced.current = true;
      } catch (err) {
        console.error("Auth sync failed:", err);
      }
    }

    sync();
  }, [isSignedIn, user]);

  return <>{children}</>;
}
