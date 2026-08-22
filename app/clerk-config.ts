export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export type ClerkRuntimeEnvironment = {
  VITE_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
};

export function getClerkPublishableKey(runtimeEnvironment?: ClerkRuntimeEnvironment) {
  return runtimeEnvironment?.VITE_CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY;
}
