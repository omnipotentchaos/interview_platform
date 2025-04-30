"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoaderUI from "@/components/LoaderUI";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  }, [router]);

  return <LoaderUI />;
}