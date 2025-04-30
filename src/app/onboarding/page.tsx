"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, UsersIcon } from "lucide-react";
import LoaderUI from "@/components/LoaderUI";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<"candidate" | "interviewer" | null>(null);
  
  const createUser = useMutation(api.users.createUserWithRole);

  useEffect(() => {
    // Get the selected role from session storage
    if (typeof window !== "undefined" && isLoaded) {
      const storedRole = sessionStorage.getItem("userRole") as "candidate" | "interviewer" | null;
      setRole(storedRole);
      setIsLoading(false);
    }
  }, [isLoaded]);

  const handleContinue = async () => {
    if (!user || !role) return;

    try {
      setIsLoading(true);
      
      await createUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        image: user.imageUrl,
        role: role
      });
      
      toast.success(`Welcome! You're registered as a ${role}`);
      
      // Clear session storage and redirect
      sessionStorage.removeItem("userRole");
      router.push("/");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to complete registration");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !isLoaded) {
    return <LoaderUI />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p>You're registering as:</p>
              <div className="flex justify-center mt-2">
                {role === "candidate" ? (
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Candidate
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    Interviewer
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              <p>Name: {user?.firstName} {user?.lastName}</p>
              <p>Email: {user?.emailAddresses[0].emailAddress}</p>
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Want to change your role? <a href="/" className="text-primary hover:underline">Go back</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}