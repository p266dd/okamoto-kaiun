"use client";

import { useActionState } from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Info, Lock } from "lucide-react";

// Types and Interfaces
import { ActionState } from "./actions";

export default function RecoverForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    success: null,
  });

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">パスワードを回復する</h1>
            <p className="text-muted-foreground text-balance"></p>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">メール</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@email.com"
              required
            />
          </div>

          <Button
            variant={isPending ? "outline" : "default"}
            type="submit"
            className="w-full"
          >
            リカバリーコードを送信
          </Button>

          {state?.success && (
            <Alert className="bg-blue-50">
              <Info />
              <AlertTitle>{state.success}</AlertTitle>
            </Alert>
          )}
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
