"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "@/assets/logo-color.png";

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
import { ArrowLeftIcon, Lock, Ship } from "lucide-react";

// Types and Interfaces
import { EmbarkActionState as ActionState } from "./actions";
import Link from "next/link";

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
            <div className="w-32 mt-4 mb-9 mx-auto md:hidden">
              <Image src={CompanyLogo} alt="Okamoto Kaiun Logo" />
            </div>
            <p className="text-muted-foreground text-balance"></p>
          </div>

          {!state?.staff ? (
            <>
              <div className="grid gap-3">
                <Label htmlFor="code">社員番号</Label>
                <Input
                  id="code"
                  name="code"
                  type="password"
                  placeholder=""
                  disabled={Boolean(state?.staff)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant={isPending ? "outline" : "default"}
                  type="submit"
                  className="w-full"
                >
                  登録画面へ進む
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <ArrowLeftIcon /> 戻る
                  </Link>
                </Button>
              </div>
            </>
          ) : !state.success ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="mb-3">
                    <p className="text-sm text-slate-500">{state.staff?.role}</p>

                    <p className="text-lg">{`${state.staff?.firstName} ${state.staff?.lastName}`}</p>
                  </CardTitle>
                  <CardDescription>
                    {!state.staff?.status ? (
                      <div className="flex gap-4 items-center">
                        <Ship />
                        <div className="flex-grow">
                          <p className="mb-2">続行するには船を選択してください。</p>
                          <Select onValueChange={(value) => setShip(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a ship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>船</SelectLabel>
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
                          <p className="mb-2">現在乗船中です。</p>
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
                    {state.staff?.status ? "下船" : "乗船"}
                  </Button>
                </CardContent>
              </Card>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                <ArrowLeftIcon />
                戻る
              </Button>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <p className="text-lg font-bold text-center">
                      <Ship className="inline-block mr-2" size={18} />
                      {state.staff.status ? "登録完了しました" : "登録完了しました。"}
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 justify-center text-center">
                  <div>
                    <p>
                      {state.staff.status
                        ? "安全な航海をお祈りします。"
                        : "おつかれさまでした。"}
                    </p>
                    <div className="mt-5">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-full"
                      >
                        <ArrowLeftIcon />
                        元の画面に戻る
                      </Button>
                    </div>
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
