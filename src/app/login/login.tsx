"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader, Lock } from "lucide-react";

// Types and Interfaces
import { ActionState } from "./actions";

import CompanyLogo from "@/assets/company_logo.png";

export default function LoginForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    success: null,
  });

  useEffect(() => {
    if (router && state?.success) {
      router.push("/");
    }
  }, [router, state]);

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <Image
              src={CompanyLogo}
              alt="Okamoto Kaiun Logo"
              className="invert max-w-40 mt-4 mb-8 sm:hidden"
            />
            <h1 className="text-2xl font-bold">ようこそ!</h1>
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
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">パスワード</Label>
              <button
                type="button"
                onClick={() => router.push("/login?action=recover")}
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                パスワードを回復します。
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            variant={isPending ? "outline" : "default"}
            type="submit"
            className="w-full"
          >
            ログイン {isPending && <Loader className="animate-spin" />}
          </Button>
          <Link
            className="text-primary"
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/login?action=embark`}
          >
            あなたはスタッフですか？
          </Link>
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
