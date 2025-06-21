"use server";

import { create } from "@/lib/data-access";
import { revalidatePath } from "next/cache";

export async function createStaff(values: {
  firstName: string;
  lastName: string;
  ship?: string | undefined;
  phone: string;
  role: string;
  salary: number;
  code: string;
}) {
  const result = await create(
    "staff",
    {
      ...values,
      ship: {
        connect: {
          id: values.ship,
        },
      },
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
