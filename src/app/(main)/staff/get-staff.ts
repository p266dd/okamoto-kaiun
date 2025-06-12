"use server";

import { findMany } from "@/lib/data-access";

// Types
import { StaffInterface } from "./page";

export async function getStaff() {
  const staff = await findMany("staff", {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      salary: true,
      code: true,
    },
  });

  if (staff.error) {
    throw Error(staff.error);
  }

  const data = staff.data as StaffInterface[];

  return data;
}
