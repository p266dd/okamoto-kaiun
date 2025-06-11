import { z } from "zod/v4";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { compareSync, hashSync } from "bcryptjs";
import { createSession } from "@/lib/session";
import { deleteSession } from "@/lib/session";
import { findUnique, update } from "@/lib/data-access";
import { _resetPasswordEmail } from "./_reset-password-email";

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
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return { success: "Logged in successfully." };
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
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + 3 * 60 * 60 * 1000))
      .sign(secret);

    // Insert token into user's data.
    const updateUser = await update("user", { token }, { where: { id: user.id } });

    if (!updateUser) {
      return { error: "Could not update user." };
    }

    // Send token to email.
    await _resetPasswordEmail({
      token: token,
      name: user.name,
      email: user.email,
    });

    // Refresh cache.
    revalidatePath("/login");

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
    const updateUser = await update(
      "user",
      { password: hashPassword, token: null },
      { where: { id: data.id } }
    );
    if (!updateUser) {
      return { error: "Could not update user." };
    }

    // Create session.
    await createSession({
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    });

    // Refresh cache.
    revalidatePath("/login");

    // Redirect user to top page.
    return { success: "Password reset successfully." };
  } catch (error) {
    console.error("Reset error: ", error);
    return { error: "An unexpected error occurred during password reset." };
  }
};

// 4. Embark Action.
export interface EmbarkActionState extends ActionState {
  staff?: {
    name: string;
    ship: string;
    currentShip?: string;
    code: string;
    status: boolean | null;
  } | null;
}

export const EmbarkAction = async function (
  prevState: EmbarkActionState,
  formData: FormData
): Promise<EmbarkActionState> {
  "use server";

  // Get data.
  const data = {
    code: formData.get("code"),
    ship: formData.get("ship"),
    status: formData.get("status") ? Boolean(formData.get("status")) : null,
  };

  // Create data schema.
  const dataSchema = z.object({
    code: z.string().length(6, { message: "Invalid code format." }),
    status: z.boolean().nullable(),
    ship: z.string().nullable(),
  });

  // Validate data.
  const validateSchema = dataSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "Invalid code." };
  }

  const { code, status, ship } = validateSchema.data;

  // Fetch staff by its code number.
  const user = await findUnique("staff", {
    where: { code: code },
  });

  if (!user) {
    return { error: "Staff not found." };
  }

  if (status === null || status === undefined) {
    return {
      staff: {
        name: user.name,
        ship: user.ship,
        currentShip: user.currentShip,
        code: code,
        status: user.status,
      },
    };
  }

  // Update User.
  const updateUser = await update(
    "staff",
    { status: !user.status, currentShip: ship },
    { where: { id: user.id } }
  );

  // Refresh cache.
  revalidatePath("/login");

  // Return staff object and success message.
  return {
    success: "Thank you!",
    staff: {
      name: updateUser.name,
      ship: updateUser.ship,
      currentShip: updateUser.currentShip,
      code: updateUser.code,
      status: updateUser.status,
    },
  };
};

// 4. Logout Action.
export async function LogoutAction() {
  "use server";
  await deleteSession();
  redirect("/login");
}
