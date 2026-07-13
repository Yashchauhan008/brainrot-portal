"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Signup is Google-only now and lives on the login page.
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
