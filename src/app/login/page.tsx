import Image from "next/image";
import CompanyLogo from "@/assets/company_logo.png";

// Shadcn
import { Card, CardContent } from "@/components/ui/card";

// Forms
import LoginForm from "./login";
import RecoverForm from "./recover";
import ResetPasswordForm from "./reset";
import EmbarkForm from "./embark";

// Actions and Types
import { LoginAction, RecoverAction, ResetAction, EmbarkAction, SearchParams } from "./actions";

export function LoginPageLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-[#f6f5f6] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0 shadow-2xl">
            <CardContent className="grid p-0 md:grid-cols-2">
              {children}
              <div className="bg-brand relative hidden  items-center justify-center md:flex">
                <Image src={CompanyLogo} alt="Okamoto Kaiun Logo" className="max-w-48" />
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

  // TODO: sanitize action and token.
  const action = getSearchParams?.action;
  const token = getSearchParams?.token;

  switch (action) {
    case "recover":
      return (
        <LoginPageLayout>
          <RecoverForm action={RecoverAction} />
        </LoginPageLayout>
      );

    case "reset":
      return (
        <LoginPageLayout>
          <ResetPasswordForm action={ResetAction} token={`${token}`} />
        </LoginPageLayout>
      );

    case "embark":
      return (
        <LoginPageLayout>
          <EmbarkForm action={EmbarkAction} />
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
