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
  id?: string;
  firstName: string;
  lastName: string;
  status: boolean;
  ship: { id: string; name: string } | null;
  code: string;
  role: string;
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
    email: z.email({ message: "メールアドレスが無効です。" }),
    password: z.string().min(1, { message: "パスワードは空にできません。" }),
  });

  // Validate and handle error.
  const validateSchema = loginSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "資格情報が無効です。" };
  }

  // Safe data.
  const { email, password } = validateSchema.data;

  try {
    // Find user by its email.
    const result = await findUnique("user", {
      where: { email: email },
    });

    if (result.error || !result.data) {
      return { error: "ユーザーが見つかりません。" };
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
      return { error: "メールアドレスまたはパスワードが間違っています。" };
    }

    // Create session.
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return { success: "ログインに成功しました。" };
  } catch (error) {
    console.error("Login error: ", error);
    return { error: "ログイン中に予期しないエラーが発生しました。" };
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
    email: z.email({ message: "メールアドレスが無効です。" }),
  });

  // Validate and handle error.
  const validateSchema = recoverSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "メールアドレスが無効です。" };
  }

  // Safe data.
  const { email } = validateSchema.data;

  try {
    // Find user by its email.
    const result = await findUnique("user", {
      where: { email: email },
    });

    if (result.error || !result.data) {
      return { error: "ユーザーが見つかりません。" };
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
      return { error: "ユーザー情報を更新できませんでした。" };
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
    return { success: "パスワードをリセットするためのリンクを送信しました。" };
  } catch (error) {
    console.error("Recover error: ", error);
    return { error: "回復中に予期しないエラーが発生しました。" };
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
      .min(1, { message: "パスワードは空にできません。" })
      .min(6, { message: "パスワードは6文字以上である必要があります。" }),
    confirmPassword: z
      .string()
      .min(1, { message: "パスワードは空にできません。" })
      .min(6, { message: "パスワードは6文字以上である必要があります。" }),
    id: z.uuid(),
  });
  const validateSchema = resetSchema.safeParse(data);
  if (!validateSchema.success) {
    return { error: "無効なパスワードです。" };
  }

  // Check if both passwords match.
  const { password, confirmPassword } = validateSchema.data;
  if (password !== confirmPassword) {
    return { error: "パスワードが一致しません。" };
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
      return { error: "ユーザー情報を更新できませんでした。" };
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
    return { success: "パスワードが正常にリセットされました。" };
  } catch (error) {
    console.error("Reset error: ", error);
    return { error: "パスワードのリセット中に予期しないエラーが発生しました。" };
  }
};

// 4. Embark Action.
export interface EmbarkActionState extends ActionState {
  staff?: StaffWithShip | null;
}

export const EmbarkAction = async function (
  prevState: EmbarkActionState,
  formData: FormData
): Promise<EmbarkActionState> {
  "use server";

  // Helper functions
  async function embarkStaff(
    staffId: string,
    shipToEmbarkId: string
  ): Promise<StaffWithShip | null> {
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
    const data = result.data as StaffWithShip;
    revalidatePath("/login");
    return data;
  }

  async function disembarkStaff(
    staffId: string
  ): Promise<StaffWithShip | { error: string }> {
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
          "有効なスケジュールが見つかりません。スタッフは既に下船しているか、データに不整合がある可能性があります。",
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
      return {
        error:
          "有効なスケジュールが見つかりません。スタッフは既に下船しているか、データに不整合がある可能性があります。",
      };
    }

    const data = result.data as StaffWithShip;
    revalidatePath("/login");

    return data;
  }

  function getCurrentStaffUIState(
    staffDb: StaffWithShip,
    inputCode: string
  ): EmbarkActionState["staff"] {
    return {
      firstName: staffDb.firstName,
      lastName: staffDb.lastName,
      ship: {
        id: staffDb.ship?.id || "",
        name: staffDb.ship?.name || "",
      },
      role: staffDb.role,
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
    code: z.string().length(6, { message: "無効なコード形式です。" }),
    status: z.boolean().nullable(),
    ship: z.string().min(1, "船舶IDは空にできません。").nullable(),
  });

  // Validate data.
  const validateSchema = dataSchema.safeParse(data);
  if (!validateSchema.success) {
    const fieldErrors = validateSchema.error.flatten().fieldErrors;
    const errorMessages = Object.values(fieldErrors).flat().join(" ");
    return { error: `無効なデータです: ${errorMessages || "検証に失敗しました。"}` };
  }

  const { code, status: newDesiredStatus, ship: shipIdFromForm } = validateSchema.data;

  // Fetch staff by its code number.
  const staffResult = await findUnique("staff", {
    where: { code: code },
    include: { ship: true },
  });

  if (staffResult.error || !staffResult.data) {
    return { error: "スタッフが見つかりません。" };
  }

  const staff = staffResult.data as StaffWithShip;

  // Initial step: Only code submitted, return current staff status
  if (newDesiredStatus === null) {
    return {
      staff: getCurrentStaffUIState(staff, code),
    };
  }

  let operationResult: StaffWithShip | null = null;

  if (newDesiredStatus === true) {
    // Attempting to embark
    if (!shipIdFromForm) {
      return {
        error: "乗船するには船舶の選択が必要です。",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    if (staff.status === true) {
      return {
        error: "スタッフは既に他の船に乗船中です。",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    operationResult = await embarkStaff(staff.id || "", shipIdFromForm);
  } else {
    // Attempting to disembark (newDesiredStatus === false)
    if (staff.status === false) {
      return {
        error: "スタッフは既に下船しています。",
        staff: getCurrentStaffUIState(staff, code),
      };
    }
    const result = await disembarkStaff(staff.id || "");
    if ("error" in result) {
      operationResult = null;
    } else {
      operationResult = result;
    }
  }

  if (!operationResult) {
    // Null means a Prisma/DB error occurred in helper
    return {
      error: "内部データベースエラーのため、スタッフ情報を更新できませんでした。",
      staff: getCurrentStaffUIState(staff, code),
    };
  }

  const updatedStaff = operationResult as StaffWithShip;

  // Refresh cache.
  revalidatePath("/login");

  // Return staff object and success message.
  return {
    success: "ありがとうございます！",
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
