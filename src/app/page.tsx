"use client";
import AnimatedLogo from "@/components/AnimatedLogo";
import { CodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserIcon, UsersIcon, User , Home} from "lucide-react";

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "interviewer" | null>(null);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleRoleSelect = (role: "candidate" | "interviewer") => {
    setSelectedRole(role);
    sessionStorage.setItem("userRole", role);
  };

  // Automatically redirect signed-in users to /home
  useEffect(() => {
    if (isSignedIn) {
      router.push("/home");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-20">
  {/* <CodeIcon className="size-12 text-emerald-500" /> */}
  {/* <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent"> */}
  <AnimatedLogo />
  {/* </h1> */}
</div>

        {/* Role selection only if signed out */}
        <SignedOut>
          <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
            {/* Candidate */}
            <Card
              className={`flex-1 transition-all ${
                selectedRole === "candidate"
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "hover:border-primary/50"
              }`}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <UserIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Candidate</CardTitle>
                <CardDescription className="text-center">
                  Looking for job interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="mr-2">✓</span> Access to practice interviews</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Join scheduled interviews</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Get feedback on performance</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Review past interview recordings</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedRole === "candidate" ? "default" : "outline"}
                  onClick={() => handleRoleSelect("candidate")}
                >
                  Select as Candidate
                </Button>
              </CardFooter>
            </Card>

            {/* Interviewer */}
            <Card
              className={`flex-1 transition-all ${
                selectedRole === "interviewer"
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "hover:border-primary/50"
              }`}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <UsersIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Interviewer</CardTitle>
                <CardDescription className="text-center">
                  Conduct technical interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="mr-2">✓</span> Schedule new interviews</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Evaluate candidates</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Provide detailed feedback</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> Access to admin dashboard</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedRole === "interviewer" ? "default" : "outline"}
                  onClick={() => handleRoleSelect("interviewer")}
                >
                  Select as Interviewer
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sign In Button */}
          <div className="mt-10 text-center">
            {selectedRole ? (
              <SignInButton mode="modal" afterSignInUrl="/onboarding">
                <Button size="lg" className="px-8">
                  Continue as {selectedRole === "candidate" ? "Candidate" : "Interviewer"}
                </Button>
              </SignInButton>
            ) : (
              <p className="text-center text-4xl font-semibold bg-gradient-to-r from-blue-500 via-teal-400 to-green-500 bg-clip-text text-transparent animate-pulse mt-[10vh] flex items-center justify-center">
  <Home className="h-10 w-10 text-primary mr-4" />
  Select your role to continue
</p>

            )}
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
