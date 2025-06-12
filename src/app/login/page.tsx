import Image from "next/image";
import { z } from "zod/v4";
import CompanyLogo from "@/assets/company_logo.png";

// Shadcn
import { Card, CardContent } from "@/components/ui/card";

// Forms
import LoginForm from "./login";
import RecoverForm from "./recover";
import ResetPasswordForm from "./reset";
import EmbarkForm from "./embark";

// Actions and Types
import {
  LoginAction,
  RecoverAction,
  ResetAction,
  EmbarkAction,
  SearchParams,
  fetchShips,
} from "./actions";
import { decrypt } from "@/lib/jwt";
import { JWTPayload } from "jose";

export function LoginPageLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="bg-[#f6f5f6] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0 shadow-2xl">
            <CardContent className="grid p-0 md:grid-cols-2">
              {children}
              <div className="bg-primary relative hidden  items-center justify-center md:flex">
                <Image
                  priority
                  src={CompanyLogo}
                  alt="Okamoto Kaiun Logo"
                  className="max-w-48"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4"></div>
        </div>
      </div>
    </div>
  );
}

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const getSearchParams = await props.searchParams;
  const paramsObject = {
    action: getSearchParams?.action,
    token: getSearchParams?.token,
  };

  // Sanitize action and token.
  const paramsSchema = z.object({
    action: z.enum(["recover", "reset", "embark"]).optional(),
    token: z.string().optional(),
  });

  const validateParams = paramsSchema.safeParse(paramsObject);

  let decryptToken: JWTPayload | null = null;
  if (validateParams.success && validateParams?.data?.token) {
    // Decrypt token if it exists.
    decryptToken = await decrypt(validateParams.data.token);
  }

  // Fetch ships for embark dropdown.
  const ships = await fetchShips();

  switch (validateParams?.data?.action) {
    case "recover":
      return (
        <LoginPageLayout>
          <RecoverForm action={RecoverAction} />
        </LoginPageLayout>
      );

    case "reset":
      return (
        <LoginPageLayout>
          <ResetPasswordForm
            action={ResetAction}
            id={decryptToken ? String(decryptToken.id) : null}
          />
        </LoginPageLayout>
      );

    case "embark":
      return (
        <LoginPageLayout>
          <EmbarkForm action={EmbarkAction} ships={ships} />
        </LoginPageLayout>
      );

    default:
      return (
        <LoginPageLayout>
          <LoginForm action={LoginAction} />
        </LoginPageLayout>
      );
  }
}
