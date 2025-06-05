"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

// Types and Interfaces
import { ActionState } from "./actions";

export default function LoginForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, { error: null, success: null });

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground text-balance"></p>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@email.com" required />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <button
                onClick={() => router.push("/login?action=recover")}
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button variant={isPending ? "outline" : "default"} type="submit" className="w-full">
            Login
          </Button>
          {state?.error && (
            <Alert variant="destructive" className="bg-red-50">
              <Lock />
              <AlertTitle>{state.error}</AlertTitle>
            </Alert>
          )}
        </div>
      </form>
    </>
  );
}
