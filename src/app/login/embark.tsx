"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "@/assets/company_logo.png";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Ship } from "lucide-react";

// Types and Interfaces
import { EmbarkActionState as ActionState } from "./actions";

export default function EmbarkForm({
  action,
  ships,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  ships: { id: string; name: string }[] | null;
}) {
  const router = useRouter();
  const [ship, setShip] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {
    error: null,
    success: null,
    staff: null,
  });

  return (
    <>
      <form action={formAction} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 mt-4 mb-9 mx-auto invert md:hidden">
              <Image src={CompanyLogo} alt="Okamoto Kaiun Logo" />
            </div>
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
              <Button
                variant={isPending ? "outline" : "default"}
                type="submit"
                className="w-full"
              >
                Apply Code
              </Button>
            </>
          ) : !state.success ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="mb-3">
                    <p className="text-sm text-slate-500">Staff</p>

                    <p className="text-lg">{state.staff?.name}</p>
                  </CardTitle>
                  <CardDescription>
                    {!state.staff?.status ? (
                      <div className="flex gap-4 items-center">
                        <Ship />
                        <div className="flex-grow">
                          <p className="mb-2">Select a ship to proceed.</p>
                          <Select onValueChange={(value) => setShip(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a ship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Ships</SelectLabel>
                                {ships &&
                                  ships.map((ship) => (
                                    <SelectItem key={`ship-${ship.id}`} value={ship.id}>
                                      {ship.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 items-center">
                        <Ship />
                        <div className="flex-grow">
                          <p className="mb-2">You are currently embarked.</p>
                        </div>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 justify-between">
                  <input type="hidden" name="code" value={state.staff?.code} readOnly />
                  <input type="hidden" name="ship" value={String(ship)} readOnly />
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
                variant="outline"
                type="button"
                onClick={() => router.push("/login")}
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
                    You have successfully{" "}
                    {state.staff.status ? "embarked" : "disembarked"} the ship. Please
                    contact your manager should you require assistance.
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
