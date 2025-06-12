"use server";

import { z } from "zod/v4";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { compareSync, hashSync } from "bcryptjs";
import { createSession } from "@/lib/session";
import { deleteSession } from "@/lib/session";
import { findMany, findUnique, update } from "@/lib/data-access";
import { _resetPasswordEmail } from "./_reset-password-email";

// 1. Login Action
// 2. Recover Action
// 3. Reset Action
// 4. Embark Action
// 5. Logout Action
// 6. Fetch ships

// Types and Interfaces.
export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export interface ActionState {
  error?: string | null;
  success?: string | null;
}
type StaffWithShip = {
  id: string;
  firstName: string;
  lastName: string;
  status: boolean;
  ship: { id: string; name: string } | null;
  code: string;
};

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
    const result = await findUnique("user", {
      where: { email: email },
    });

    if (result.error || !result.data) {
      return { error: "User not found." };
    }

    const user = result.data as {
      id: string;
      name: string;
      email: string;
      password: string;
    };

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
    const result = await findUnique("user", {
      where: { email: email },
    });

    if (result.error || !result.data) {
      return { error: "User not found." };
    }

    const user = result.data as {
      id: string;
      name: string;
      email: string;
    };

    // Generate token.
    const secret = new TextEncoder().encode(process.env.SECRET);
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + 3 * 60 * 60 * 1000))
      .sign(secret);

    // Insert token into user's data.
    const updateUser = await update("user", { data: { token }, where: { id: user.id } });

    if (updateUser.error || !updateUser.data) {
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
    const updateUser = await update("user", {
      data: { password: hashPassword, token: null },
      where: { id: data.id },
    });
    if (updateUser.error || !updateUser.data) {
      return { error: "Could not update user." };
    }

    const user = updateUser.data as {
      id: string;
      name: string;
      email: string;
    };

    // Create session.
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
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
    code: string;
    status: boolean | null;
  } | null;
}

export const EmbarkAction = async function (
  prevState: EmbarkActionState,
  formData: FormData
): Promise<EmbarkActionState> {
  "use server";

  // Helper functions
  async function embarkStaff(staffId: string, shipToEmbarkId: string) {
    const result = await update("staff", {
      data: {
        status: true,
        shipId: shipToEmbarkId,
        schedule: {
          create: {
            embark: new Date(),
            ship: { connect: { id: shipToEmbarkId } },
          },
        },
      },
      where: { id: staffId },
      include: { ship: true },
    });

    if (result.error) {
      console.error("Embark error:", result.error);
      return null;
    }
    return result.data;
  }

  async function disembarkStaff(staffId: string) {
    const scheduleResult = await findMany("schedule", {
      where: {
        staffId: staffId,
        desembark: null,
      },
      orderBy: { embark: "desc" },
      take: 1,
    });

    if (
      scheduleResult.error ||
      !scheduleResult.data ||
      scheduleResult.data.length === 0
    ) {
      console.error(
        "Active schedule not found for disembarkation for staff:",
        staffId,
        scheduleResult.error
      );
      return {
        error:
          "No active schedule found. Staff may already be disembarked or data is inconsistent.",
      };
    }
    const activeSchedule = scheduleResult.data[0] as { id: string };

    const result = await update("staff", {
      data: {
        status: false,
        shipId: null,
        schedule: {
          update: {
            where: { id: activeSchedule.id },
            data: { desembark: new Date() },
          },
        },
      },
      where: { id: staffId },
      include: { ship: true },
    });

    if (result.error) {
      console.error("Disembark error:", result.error);
      return null;
    }

    return result.data;
  }

  function getCurrentStaffUIState(
    staffDb: StaffWithShip,
    inputCode: string
  ): EmbarkActionState["staff"] {
    return {
      name: `${staffDb.firstName} ${staffDb.lastName}`,
      ship: staffDb.ship?.name || "",
      code: inputCode,
      status: staffDb.status,
    };
  }

  // Get data.
  const data = {
    code: formData.get("code"),
    ship: formData.get("ship"),
    status:
      formData.get("status") === "true"
        ? true
        : formData.get("status") === "false"
        ? false
        : null,
  };

  // Create data schema.
  const dataSchema = z.object({
    code: z.string().length(6, { message: "Invalid code format." }),
    status: z.boolean().nullable(),
    ship: z.string().min(1, "Ship ID cannot be empty if provided.").nullable(),
  });

  // Validate data.
  const validateSchema = dataSchema.safeParse(data);
  if (!validateSchema.success) {
    const fieldErrors = validateSchema.error.flatten().fieldErrors;
    const errorMessages = Object.values(fieldErrors).flat().join(" ");
    return { error: `Invalid data: ${errorMessages || "Validation failed."}` };
  }

  const { code, status: newDesiredStatus, ship: shipIdFromForm } = validateSchema.data;

  // Fetch staff by its code number.
  const staffResult = await findUnique("staff", {
    where: { code: code },
    include: { ship: true },
  });

  if (staffResult.error || !staffResult.data) {
    return { error: "Staff not found." };
  }

  const staff = staffResult.data as StaffWithShip;

  // Initial step: Only code submitted, return current staff status
  if (newDesiredStatus === null) {
    return {
      staff: getCurrentStaffUIState(staff, code),
    };
  }

  let operationResult: any = null;

  if (newDesiredStatus === true) {
    // Attempting to embark
    if (!shipIdFromForm) {
      return {
        error: "Ship selection is required to embark.",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    if (staff.status === true) {
      return {
        error: "Staff is already embarked.",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    operationResult = await embarkStaff(staff.id, shipIdFromForm);
  } else {
    // Attempting to disembark (newDesiredStatus === false)
    if (staff.status === false) {
      return {
        error: "Staff is already disembarked.",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    operationResult = await disembarkStaff(staff.id);
  }

  if (!operationResult) {
    // Null means a Prisma/DB error occurred in helper
    return {
      error: "Could not update staff due to an internal database error.",
      staff: getCurrentStaffUIState(staff, code),
    };
  }
  if (operationResult.error) {
    // Helper returned an error object (e.g., no active schedule)
    return { error: operationResult.error, staff: getCurrentStaffUIState(staff, code) };
  }

  const updatedStaff = operationResult as StaffWithShip;

  // Refresh cache.
  revalidatePath("/login");

  // Return staff object and success message.
  return {
    success: "Thank you!",
    staff: getCurrentStaffUIState(updatedStaff, code),
  };
};

// 5. Logout Action.
export async function LogoutAction() {
  "use server";
  await deleteSession();
  redirect("/login");
}

// 6. Fetch ships
export async function fetchShips() {
  "use server";
  const result = await findMany("ship");

  if (result.error || !result.data) {
    return null;
  }

  return result.data as { id: string; name: string }[];
}
