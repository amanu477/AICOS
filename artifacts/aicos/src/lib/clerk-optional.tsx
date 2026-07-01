/**
 * Safe Clerk wrappers for when ClerkProvider may not be present.
 * Components should use useOptionalUser() instead of useUser() directly.
 */
import { createContext, useContext, type ReactNode } from "react";
import { useUser } from "@clerk/react";

interface OptionalUser {
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
}

interface UserContextValue {
  user: OptionalUser | null | undefined;
  isLoaded: boolean;
}

const UserCtx = createContext<UserContextValue>({ user: null, isLoaded: true });

/** Rendered only inside <ClerkProvider> — safely calls useUser(). */
function ClerkUserBridge({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  return <UserCtx.Provider value={{ user, isLoaded }}>{children}</UserCtx.Provider>;
}

/**
 * Wrap your app tree with this. When clerkEnabled=true it must be inside
 * <ClerkProvider>. When false it provides null user with no Clerk dependency.
 */
export function OptionalUserProvider({
  children,
  clerkEnabled,
}: {
  children: ReactNode;
  clerkEnabled: boolean;
}) {
  if (clerkEnabled) {
    return <ClerkUserBridge>{children}</ClerkUserBridge>;
  }
  return (
    <UserCtx.Provider value={{ user: null, isLoaded: true }}>
      {children}
    </UserCtx.Provider>
  );
}

/** Drop-in replacement for useUser() that never throws without ClerkProvider. */
export function useOptionalUser(): UserContextValue {
  return useContext(UserCtx);
}
