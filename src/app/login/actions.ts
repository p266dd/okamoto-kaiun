import { z } from "zod/v4";
import { redirect, RedirectType } from "next/navigation";
import { compareSync } from "bcryptjs";
import { createSession } from "@/lib/session";
import { findUnique } from "@/lib/data-access";

// Types and Interfaces.
export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export interface ActionState {
  error?: string | null;
  success?: string | null;
}

export const LoginAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  // Get data.
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Create schema.
  const loginSchema = z.object({
    email: z.email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password cannot be empty." }),
  });

  // Validate and handle error.
  const validateSchema = loginSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: `Credentials are invalid` };
  }

  // Safe data.
  const { email, password } = validateSchema.data;

  try {
    // 2. Find user by its email.
    const user = await findUnique("user", {
      where: { email: email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    // 3. Compare password.
    const passwordsMatch = compareSync(password, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect email or password." };
    }

    // 4. Create session.
    const newSession = await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // 6. Redirect user to top page.
    redirect("/", RedirectType.push);
  } catch (error) {
    console.error("Login error: ", error);
    return { error: "An unexpected error occurred during login." };
  }

  return {};
};

export const RecoverAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};

export const ResetAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};

export const EmbarkAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};
