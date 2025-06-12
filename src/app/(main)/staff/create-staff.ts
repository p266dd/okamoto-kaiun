"use server";

import { create } from "@/lib/data-access";
import { revalidatePath } from "next/cache";

export async function createStaff(values: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  salary: number;
  code: string;
}) {
  const result = await create(
    "staff",
    {
      ...values,
      salary: parseInt(values.salary.toString()),
    },
    { select: { id: true } }
  );

  if (result.error) {
    return Promise.reject(result.error);
  }

  revalidatePath("/staff");
  revalidatePath("/");
  return result.data;
}
