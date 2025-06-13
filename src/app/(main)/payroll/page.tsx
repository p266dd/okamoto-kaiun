"use client";

import { useState, useEffect } from "react";
import { z } from "zod/v4";
import {
  format,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  max,
  min,
} from "date-fns";
import { ja } from "date-fns/locale";
import { fetchShips } from "@/app/login/actions";
import { getScheduleData } from "@/app/(main)/actions/get-schedule";

// Shadcn
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/date-picker";
import { Label } from "@/components/ui/label";
import { ShipIcon } from "lucide-react";

// Types
import { Staff } from "@/lib/prisma/generate";
import { Schedule } from "@/lib/prisma/generate";

type Ships = {
  id: string;
  name: string;
};

type PayrollForm = {
  shipID: string;
  start: Date | null;
  finish: Date | null;
};

// Type for the raw data fetched from getScheduleData
type FetchedScheduleData = {
  staff: Staff[];
  schedules: Schedule[];
};

type StaffPayrollRow = Staff & {
  workedDays: number;
};

// Default date range (e.g., current month)
const initialDefaultStart = startOfMonth(new Date());
const initialDefaultEnd = endOfMonth(new Date());

export default function PayrollPage() {
  const [availableShips, setAvailableShips] = useState<Ships[]>([]);
  // State to hold the processed list of staff with their worked days for the table.
  const [payrollStaffList, setPayrollStaffList] = useState<StaffPayrollRow[]>([]);
  const [payroll, setPayroll] = useState<PayrollForm>({
    shipID: "cmbsxmjz60000ycvb6i0b7j16", // Default ship ID
    start: initialDefaultStart,
    finish: initialDefaultEnd,
  });

  useEffect(() => {
    const loadShips = async () => {
      try {
        const ships = await fetchShips();
        setAvailableShips(ships || []);
      } catch (error) {
        console.error("Error fetching ships:", error);
      }
    };

    loadShips();
  }, []);

  useEffect(() => {
    const fetchAndProcessScheduleData = async () => {
      if (!payroll.start || !payroll.finish || !payroll.shipID) {
        setPayrollStaffList([]); // Clear data if inputs are incomplete.
        return;
      }

      try {
        // Fetches staff and all their schedules for the given ship
        // that potentially overlap with the payroll period.
        const fetchedData: FetchedScheduleData = await getScheduleData(
          payroll.start,
          payroll.finish,
          payroll.shipID
        );
        if (!fetchedData || !fetchedData.staff || !fetchedData.schedules) {
          setPayrollStaffList([]);
          return;
        }

        const { staff: allStaffForShip, schedules: allSchedulesForShip } = fetchedData;
        const workedDaysByStaffId: Map<string, number> = new Map();

        allSchedulesForShip.forEach((schedule) => {
          const scheduleStart = new Date(schedule.embark);
          // If desembark is null, staff is currently on board.
          // For calculation, cap at payroll.finish.
          const scheduleEnd = schedule.desembark
            ? new Date(schedule.desembark)
            : payroll.finish!;

          // Determine the effective period of work within the payroll dates
          const effectiveStart = max([scheduleStart, payroll.start!]);
          const effectiveEnd = min([scheduleEnd, payroll.finish!]);

          if (effectiveStart <= effectiveEnd) {
            // differenceInCalendarDays gives the number of full days between two dates.
            // Add 1 to make it inclusive of start and end day.
            const daysWorkedInSegment =
              differenceInCalendarDays(effectiveEnd, effectiveStart) + 1;
            if (daysWorkedInSegment > 0) {
              workedDaysByStaffId.set(
                schedule.staffId,
                (workedDaysByStaffId.get(schedule.staffId) || 0) + daysWorkedInSegment
              );
            }
          }
        });

        const newPayrollStaffList: StaffPayrollRow[] = allStaffForShip
          .map((staffMember) => {
            const workedDays = workedDaysByStaffId.get(staffMember.id) || 0;
            // Only include staff who actually worked during the selected period
            return workedDays > 0 ? { ...staffMember, workedDays } : null;
          })
          .filter(Boolean) as StaffPayrollRow[]; // Filter out nulls

        setPayrollStaffList(newPayrollStaffList);
      } catch (error) {
        console.error("Error fetching or processing schedule data:", error);
        setPayrollStaffList([]); // Clear data on error.
      }
    };

    fetchAndProcessScheduleData();
  }, [payroll.start, payroll.finish, payroll.shipID]); // Refetch when these dependencies change

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-6 sm:px-12 md:px-20 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
        <div className="flex gap-4">
          <Card>
            <CardContent className="flex flex-col gap-2">
              <div>
                <ShipIcon />
              </div>
              <div>
                <p className="text-lg">
                  {availableShips.find((s) => s.id === payroll.shipID)?.name ||
                    "Loading..."}
                </p>
                <p className="text-xs text-gray-400">現在の視聴状況</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shipSelect">Select Ship</Label>
            <Select
              value={payroll.shipID}
              onValueChange={(value) => {
                if (value) {
                  setPayroll((prev) => ({ ...prev, shipID: value }));
                }
              }}
            >
              <SelectTrigger id="shipSelect" className="w-[180px]">
                <SelectValue placeholder="Select a ship" />
              </SelectTrigger>

              <SelectContent>
                {availableShips.map((ship) => (
                  <SelectItem key={ship.id} value={ship.id}>
                    {ship.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dateFrom">From</Label>
            <DatePicker
              selected={payroll.start}
              handleChange={(
                date // date is Date | undefined
              ) => setPayroll((prev) => ({ ...prev, start: date || null }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dateTo">To</Label>
            <DatePicker
              selected={payroll.finish}
              handleChange={(
                date // date is Date | undefined
              ) => setPayroll((prev) => ({ ...prev, finish: date || null }))}
            />
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-12 md:px-20">
        <Table>
          <TableCaption className="text-left">
            {payrollStaffList.length > 0
              ? `選択した船舶および期間のスタッフのリスト。`
              : `選択した条件に該当するスタッフデータはありません。`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メール</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>ピンコード</TableHead>
              <TableHead>役割</TableHead>
              <TableHead>給料</TableHead>
              <TableHead className="text-right">勤務日数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollStaffList.length > 0 ? (
              payrollStaffList.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    {`${staffMember.firstName || ""} ${
                      staffMember.lastName || ""
                    }`.trim()}
                  </TableCell>
                  <TableCell>{staffMember.email || "N/A"}</TableCell>
                  <TableCell>{staffMember.phone || "N/A"}</TableCell>
                  <TableCell>{staffMember.code || "N/A"}</TableCell>
                  <TableCell className="capitalize">
                    {staffMember.role || "N/A"}
                  </TableCell>
                  <TableCell>
                    {typeof staffMember.salary === "number"
                      ? `¥ ${staffMember.salary.toLocaleString()}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {`¥ ${staffMember.workedDays * Number(staffMember.salary)}`}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  スタッフデータがありません。船舶と日付の範囲を選択してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
