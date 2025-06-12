"use server";

import { update } from "@/lib/data-access";
import { revalidatePath } from "next/cache";

export async function updateStaff(
  id: string,
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
    code: string;
  }
) {
  const result = await update("staff", {
    data: {
      ...values,
    },
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (result.error) {
    return Promise.reject(result.error);
  }

  revalidatePath("/staff");
  revalidatePath("/");
  return result.data;
}
