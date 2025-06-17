"use server";

import { update, findUnique } from "@/lib/data-access";
import { revalidatePath } from "next/cache";

// Type for the schedule data fetched.
interface ExistingScheduleData {
  shipId: string | null;
  staffId: string | null;
}

export async function updateScheduleData(schedule: {
  shipID?: string | undefined;
  embark?: Date | null;
  desembark?: Date | null;
  scheduleId: string;
}) {
  try {
    // 1. Fetch the current state of the schedule.
    const existingScheduleResult = await findUnique<ExistingScheduleData>("schedule", {
      where: { id: schedule.scheduleId },
      select: { shipId: true, staffId: true },
    });

    if (existingScheduleResult.error || !existingScheduleResult.data) {
      const errorMsg = existingScheduleResult.error || "Original schedule not found.";
      console.error("Error fetching existing schedule:", errorMsg);
      return Promise.reject(errorMsg);
    }

    const currentSchedule = existingScheduleResult.data;
    const staffId = currentSchedule.staffId;

    // 2. If ship id is different, and staffId exists, update staff's shipId.
    if (
      schedule.shipID !== undefined &&
      staffId &&
      schedule.desembark === null &&
      schedule.shipID !== currentSchedule.shipId
    ) {
      const staffUpdateResult = await update("staff", {
        data: { shipId: schedule.shipID }, // Update staff's shipId to the new shipID.
        where: { id: staffId },
      });

      if (staffUpdateResult.error) {
        console.error(`Error updating staff ${staffId} shipId:`, staffUpdateResult.error);
        return Promise.reject(
          `Failed to update associated staff's ship: ${staffUpdateResult.error}`
        );
      }
    }

    // 3. Prepare payload for schedule update.
    const scheduleUpdatePayload: {
      shipId?: string | undefined;
      embark?: Date | null;
      desembark?: Date | null;
    } = {};

    if (schedule.shipID !== undefined) {
      scheduleUpdatePayload.shipId = schedule.shipID;
    }
    if (schedule.embark !== undefined) {
      scheduleUpdatePayload.embark = schedule.embark;
    }
    if (schedule.desembark !== undefined) {
      scheduleUpdatePayload.desembark = schedule.desembark;
    }

    let updatedScheduleData: ExistingScheduleData | { id: string } = currentSchedule;

    if (Object.keys(scheduleUpdatePayload).length > 0) {
      const scheduleUpdateDbResult = await update("schedule", {
        data: scheduleUpdatePayload,
        where: { id: schedule.scheduleId },
      });

      if (scheduleUpdateDbResult.error || !scheduleUpdateDbResult.data) {
        const errorMsg = scheduleUpdateDbResult.error || "Failed to update schedule.";
        console.error("Error updating schedule data:", errorMsg);
        return Promise.reject(errorMsg);
      }
      updatedScheduleData = scheduleUpdateDbResult.data as ExistingScheduleData;
    } else {
      // console.log("No direct changes to apply to the schedule entity itself.");
    }

    revalidatePath("/payroll");
    revalidatePath("/");
    return updatedScheduleData;
  } catch (error: unknown) {
    console.error("Unexpected error in updateScheduleData:", error);
    const errorMessage = "An unexpected error occurred.";
    return Promise.reject(errorMessage);
  }
}
