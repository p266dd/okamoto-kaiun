import LoginForm from "./login";
import RecoverForm from "./recover";

// Types and Interfaces
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export interface ActionState {
  error?: String | null;
  success?: String | null;
}

// Actions
const LoginAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};

const RecoverAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};

export function LoginPageLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-[#f6f5f6] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">{children}</div>
    </div>
  );
}

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const getSearchParams = await props.searchParams;
  const action = getSearchParams?.action;

  switch (action) {
    case "recover":
      return (
        <LoginPageLayout>
          <RecoverForm action={RecoverAction} />
        </LoginPageLayout>
      );
      break;

    default:
      return (
        <LoginPageLayout>
          <LoginForm action={LoginAction} />
        </LoginPageLayout>
      );
  }
}
