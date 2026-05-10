import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/RegisterForm";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

