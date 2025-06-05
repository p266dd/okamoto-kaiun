"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "@/assets/company_logo.png";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Ship } from "lucide-react";

// Types and Interfaces
import { EmbarkActionState as ActionState } from "./actions";

export default function EmbarkForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    success: null,
    staff: null,
  });

  console.log(state);

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 mt-4 mb-9 mx-auto invert sm:hidden">
              <Image src={CompanyLogo} alt="Okamoto Kaiun Logo" />
            </div>
            <h1 className="text-2xl font-bold">Embark / Disembark</h1>
            <p className="text-muted-foreground text-balance"></p>
          </div>

          {!state?.staff ? (
            <>
              <div className="grid gap-3">
                <Label htmlFor="code">Staff Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="password"
                  placeholder="••••••••"
                  disabled={Boolean(state?.staff)}
                  required
                />
              </div>
              <Button variant={isPending ? "outline" : "default"} type="submit" className="w-full">
                Apply Code
              </Button>
            </>
          ) : !state.success ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p className="text-lg">Dhavidy Pires</p>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex gap-4 items-center">
                      <Ship />
                      <p>
                        Currently assigned to ship: <br />
                        <strong className="font-semibold">{state?.staff?.ship || "None"}</strong>
                      </p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 justify-between">
                  <input type="hidden" name="code" value={state.staff?.code} readOnly />
                  <input
                    type="hidden"
                    name="status"
                    value={String(Boolean(!state.staff?.status))}
                    readOnly
                  />
                  <Button
                    variant={isPending ? "outline" : "default"}
                    type="submit"
                    size="lg"
                    className="flex-grow"
                  >
                    {state.staff?.status ? "Disembark" : "Embark"}
                  </Button>
                </CardContent>
              </Card>
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.refresh()}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p className="text-lg font-bold text-center">
                      <Ship className="inline-block mr-2" size={18} />
                      {state.staff.status ? "Embarked" : "Disembarked"}
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 justify-between text-center">
                  <div>
                    You have successfully {state.staff.status ? "embarked" : "disembarked"} the
                    ship. Please contact your manager should you require assistance.
                  </div>
                </CardContent>
              </Card>
            </>
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
