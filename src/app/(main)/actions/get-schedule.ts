import { findMany } from "@/lib/data-access";
import { Prisma } from "@/lib/prisma/generate/client";
import { addDays, startOfDay } from "date-fns";

import { Schedule, Staff } from "@/lib/prisma/generate";

export async function getScheduleData(
  startDate: Date,
  endDate: Date,
  shipId?: string | null
) {
  try {
    // Fetch all staff members
    const staff = await findMany("staff", {
      orderBy: {
        firstName: "asc", // Or any other desired order
      },
    });

    if (staff.error || !staff.data) {
      console.error("Error fetching staff data:", staff.error);
      return { staff: [], schedules: [] };
    }

    const staffData = staff.data as Staff[];

    // Construct the where clause for schedules
    // A schedule overlaps if its embark date is before or on the end date
    // AND its desembark date is after or on the start date (or desembark is null).
    const scheduleWhereClause: Prisma.ScheduleWhereInput = {
      embark: {
        lte: addDays(endDate, 1), // Include schedules starting on the end date
      },
      OR: [
        {
          desembark: {
            gte: startOfDay(startDate), // Include schedules ending on or after the start date
          },
        },
        {
          desembark: null, // Include ongoing schedules
        },
      ],
    };

    // If a shipId is provided, add it to the where clause to filter schedules
    if (shipId) {
      scheduleWhereClause.shipId = shipId;
    }

    const schedules = await findMany("schedule", {
      where: shipId === "all" ? undefined : scheduleWhereClause,
      include: {
        staff: true, // Include related staff info
        ship: true, // Include related ship info
      },
    });

    if (schedules.error || !schedules.data) {
      console.error("Error fetching schedule data:", schedules.error);
      return { staff: [], schedules: [] };
    }

    const schedulesData = schedules.data as Schedule[];

    return { staff: staffData, schedules: schedulesData };
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    return { staff: [], schedules: [] };
  }
}
