"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types and Interfaces
import { ActionState } from "./actions";

export default function RecoverForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Recover Password</h1>
            <p className="text-muted-foreground text-balance"></p>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@email.com" required />
          </div>

          <Button type="submit" className="w-full">
            Send Recovery Code
          </Button>
        </div>
      </form>
    </>
  );
}
