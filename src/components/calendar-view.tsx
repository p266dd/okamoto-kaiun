"use client";

import { ReactElement, useRef, useState } from "react";
import {
  format,
  addDays,
  subDays,
  eachDayOfInterval,
  startOfDay,
  parse,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Dot, Loader } from "lucide-react";

// Shadcn
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// Interface.
import { Staff } from "@/app/(main)/page";

// Mockup
const schedule = [
  { id: "1", start: "June 5th 2025", end: "June 7th 2025", staff: ["1"], status: "" },
  { id: "2", start: "June 1st 2025", end: "June 12th 2025", staff: ["3"], status: "" },
  { id: "3", start: "June 9th 2025", end: "June 20th 2025", staff: ["1"], status: "" },
  { id: "4", start: "July 7th 2025", end: "August 20th 2025", staff: ["4"], status: "" },
  { id: "5", start: "April 20th 2025", end: "June 3rd 2025", staff: ["4"], status: "" },
];

export const CalendarView = ({ staff }: { staff: Staff[] }) => {
  const today = new Date();

  // Helper to parse schedule dates.
  const parsedSchedules = schedule.map((item) => ({
    ...item,
    startDate: parse(item.start, "MMMM do yyyy", new Date()),
    endDate: parse(item.end, "MMMM do yyyy", new Date()),
  }));

  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState<boolean>(false);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [displayedDays, setDisplayedDays] = useState<Date[]>(() => {
    const startDate = subDays(startOfDay(today), 5);
    const endDate = addDays(startOfDay(today), 45);
    return eachDayOfInterval({ start: startDate, end: endDate });
  });

  const loadPastDays = async () => {
    // Wait to load before loading more.
    if (isLoadingPrev || displayedDays.length === 0) return;
    setIsLoadingPrev(true);

    const firstDay = displayedDays[0];
    const endDate = subDays(firstDay, 1);
    const startDate = subDays(endDate, 7 - 1); // -1 because eachDayOfInterval is inclusive.

    // Simulate network latency if needed
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDays = eachDayOfInterval({ start: startDate, end: endDate });
    setDisplayedDays((prevDays) => [...newDays, ...prevDays]);
    setIsLoadingPrev(false);
  };

  const loadfutureDays = async () => {
    // Wait to load before loading more.
    if (isLoadingNext || displayedDays.length === 0) return;
    setIsLoadingNext(true);

    const lastDay = displayedDays[displayedDays.length - 1];
    const startDate = addDays(lastDay, 1);
    const endDate = addDays(startDate, 14 - 1); // -1 because eachDayOfInterval is inclusive.

    // Simulate network latency if needed
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDays = eachDayOfInterval({ start: startDate, end: endDate });
    setDisplayedDays((prevDays) => [...prevDays, ...newDays]);
    setIsLoadingNext(false);
  };

  return (
    <div className="flex">
      <div className="shrink">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-primary text-primary-foreground border-l border-r border-slate-200">
                Staff
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((staff) => (
              <TableRow key={staff.id} className="hover:bg-gray-100 h-9">
                <TableCell className="bg-blue-100 font-medium pr-4 sm:pr-12">
                  {staff.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="relative w-3/4 flex-grow">
        <div
          onClick={async () => await loadPastDays()}
          className="absolute top-1/2 left-2 -translate-y-1/3 w-10 h-1/2 bg-slate-600/30 hover:bg-slate-600 z-50 rounded-full flex items-center justify-center cursor-pointer"
        >
          {isLoadingPrev ? (
            <Loader className="stroke-white animate-spin" />
          ) : (
            <ChevronLeft className="stroke-white" />
          )}
        </div>
        <div
          onClick={async () => await loadfutureDays()}
          className="absolute top-1/2 right-2 -translate-y-1/3 w-10 h-1/2 bg-slate-600/30 hover:bg-slate-600 z-50 rounded-full flex items-center justify-center cursor-pointer"
        >
          {isLoadingNext ? (
            <Loader className="stroke-white animate-spin" />
          ) : (
            <ChevronRight className="stroke-white" />
          )}
        </div>
        <ScrollArea
          className="w-full whitespace-nowrap border bg-background"
          type="always"
        >
          <Table
            className="min-w-full"
            onMouseLeave={() => setHoveredColumnIndex(null)} // Reset hover when mouse leaves the table
          >
            <TableHeader>
              <TableRow>
                {displayedDays.map((day, i) => (
                  <TableHead
                    key={day.toISOString()}
                    onMouseEnter={() => setHoveredColumnIndex(i)}
                    className={`w-[50px] text-center border-l border-r border-slate-200 ${
                      isSameDay(today, day)
                        ? "bg-primary text-primary-foreground"
                        : hoveredColumnIndex === i
                        ? "bg-gray-100 text-foreground"
                        : ""
                    }`}
                  >
                    <div>{format(day, "EEE")}</div>
                    <div>{format(day, "MMM do")}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-gray-100 h-9">
                  {displayedDays.map((day, i) => {
                    let cellContent: ReactElement | null = null;
                    const currentDayStart = startOfDay(day);

                    // Find the relevant schedule for the current staff and day
                    const relevantSchedule = parsedSchedules.find(
                      (s) =>
                        staff.schedules.includes(s.id) && // Ensure this schedule ID is in the staff's assigned schedules
                        isWithinInterval(currentDayStart, {
                          start: startOfDay(s.startDate),
                          end: startOfDay(s.endDate),
                        })
                    );

                    if (relevantSchedule) {
                      const scheduleStartDate = startOfDay(relevantSchedule.startDate);
                      const scheduleEndDate = startOfDay(relevantSchedule.endDate);

                      if (isSameDay(currentDayStart, scheduleStartDate)) {
                        cellContent = (
                          <div className="relative flex items-center h-full justify-end">
                            <span className="block w-1/2 h-1 bg-primary"></span>
                            <span className="absolute z-20 flex items-center justify-center top-0 right-0 w-full h-full">
                              <span className="rounded-full bg-primary text-primary-foreground text-xs">
                                <Dot />
                              </span>
                            </span>
                          </div>
                        );
                      } else if (isSameDay(currentDayStart, scheduleEndDate)) {
                        cellContent = (
                          <div className="relative flex items-center h-full justify-start">
                            <span className="block w-1/2 h-1 bg-primary"></span>
                            <span className="absolute z-20 flex items-center justify-center top-0 right-0 w-full h-full">
                              <span className="rounded-full bg-primary text-primary-foreground text-xs">
                                <Dot />
                              </span>
                            </span>
                          </div>
                        );
                      } else {
                        cellContent = (
                          <div>
                            <span className="block w-full h-1 bg-primary"></span>
                          </div>
                        );
                      }
                    }

                    return (
                      <TableCell
                        key={i + day.toISOString()}
                        onMouseEnter={() => setHoveredColumnIndex(i)}
                        className={`text-center p-0 ${
                          isSameDay(today, day)
                            ? "bg-blue-100"
                            : hoveredColumnIndex === i
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar className="h-4 translate-y-6" orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
