"use server";

import { remove } from "@/lib/data-access";
import { revalidatePath } from "next/cache";

export async function deleteStaff(id: string) {
  const result = await remove("staff", {
    where: {
      id: id,
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
