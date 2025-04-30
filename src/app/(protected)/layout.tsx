"use client";

import { useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import StreamClientProvider from "@/components/providers/StreamClientProvider";
import LoaderUI from "@/components/LoaderUI";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  
  if (!isLoaded) return <LoaderUI />;

  return (
    <>
      <SignedIn>
        <div className="min-h-screen">
          <Navbar />
          <StreamClientProvider>
            <main className="px-4 sm:px-6 lg:px-8">{children}</main>
          </StreamClientProvider>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}