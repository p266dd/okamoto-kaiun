import { z } from "zod/v4";
import { redirect, RedirectType } from "next/navigation";
import { compareSync, hashSync } from "bcryptjs";
import { SignJWT } from "jose";
import { createSession } from "@/lib/session";
import { findUnique, update } from "@/lib/data-access";

// 1. Login Action
// 2. Recover Action
// 3. Reset Action
// 4. Embark Action

// Types and Interfaces.
export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export interface ActionState {
  error?: string | null;
  success?: string | null;
}

// 1. Login Action.
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
    // Find user by its email.
    const user = await findUnique("user", {
      where: { email: email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    // Compare password.
    const passwordsMatch = compareSync(password, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect email or password." };
    }

    // Create session.
    const newSession = await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Redirect user to top page.
    return redirect("/", RedirectType.push);
  } catch (error) {
    console.error("Login error: ", error);
    return { error: "An unexpected error occurred during login." };
  }
};

// 2. Recover Action.
export const RecoverAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";

  // Get data.
  const data = {
    email: formData.get("email"),
  };

  // Create schema.
  const recoverSchema = z.object({
    email: z.email({ message: "Invalid email address." }),
  });

  // Validate and handle error.
  const validateSchema = recoverSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "Invalid email address." };
  }

  // Safe data.
  const { email } = validateSchema.data;

  try {
    // Find user by its email.
    const user = await findUnique("user", {
      where: { email: email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    // Generate token.
    const secret = new TextEncoder().encode(process.env.SECRET);
    const token = new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + 3 * 60 * 60 * 1000))
      .sign(secret);

    // Insert token into user's data.
    const updateUser = await update("user", { token }, { where: { id: user.id } });

    if (!updateUser) {
      return { error: "Could not update user." };
    }

    // Send code to email.
    // TODO <==

    // Return message to be displayed.
    return { success: "We've sen't you a link to reset your password." };
  } catch (error) {
    console.error("Recover error: ", error);
    return { error: "An unexpected error occurred during recovery." };
  }
};

// 3. Reset Action.
export const ResetAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  // Get data.
  const data = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    id: formData.get("id"),
  };

  // Vallidate data.
  const resetSchema = z.object({
    password: z
      .string()
      .min(1, { message: "Password cannot be empty." })
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Password cannot be empty." })
      .min(6, { message: "Password must be at least 6 characters." }),
    id: z.uuid(),
  });
  const validateSchema = resetSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "Invalid passwords." };
  }

  // Check if both passwords match.
  const { password, confirmPassword } = validateSchema.data;
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Hash password.
  const hashPassword = hashSync(password, 10);

  try {
    // Update user.
    const updateUser = await update("user", { password: hashPassword }, { where: { id: data.id } });
    if (!updateUser) {
      return { error: "Could not update user." };
    }

    // Create session.
    const newSession = await createSession({
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    });

    // Redirect user to top page.
    return redirect("/", RedirectType.push);
  } catch (error) {
    console.error("Reset error: ", error);
    return { error: "An unexpected error occurred during password reset." };
  }
};

// 4. Embark Action.
export const EmbarkAction = async function (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  return {};
};
