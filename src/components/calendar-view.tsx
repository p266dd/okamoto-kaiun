"use client";

import { ReactElement, useRef, useState, useEffect, useMemo } from "react";
import {
  setDefaultOptions,
  format,
  addDays,
  subDays,
  eachDayOfInterval,
  startOfDay,
  isWithinInterval,
  isSameDay,
  isSunday,
  isSaturday,
} from "date-fns";
import { ja } from "date-fns/locale";
import CalendarDialog from "@/components/calendar-dialog";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

// Shadcn
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Interface.
import { Staff } from "@/app/(main)/page";

// Set the default locale to Japan.
setDefaultOptions({ locale: ja });

// Mockup
const staff: Staff[] = [
  { id: "1", name: "Dhavidy", schedules: ["1"], role: "cook" },
  { id: "2", name: "Hiroko", schedules: ["1"], role: "deck" },
  { id: "3", name: "Senoo", schedules: ["1"], role: "engine" },
];

const schedule = [
  {
    id: "1",
    start: new Date("June 1, 2025"),
    end: new Date("June 12, 2025"),
    staff: ["1"],
    status: "",
  },
];

export const CalendarView = () => {
  const today = new Date();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const todayColumnRef = useRef<HTMLTableCellElement | null>(null);

  // Helper to parse schedule dates.
  const parsedSchedules = schedule.map((item) => ({
    ...item,
    startDate: item.start,
    endDate: item.end,
  }));

  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState<boolean>(false);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [displayedDays, setDisplayedDays] = useState<Date[]>(() => {
    const startDate = subDays(startOfDay(today), 20);
    const endDate = addDays(startOfDay(today), 20);
    return eachDayOfInterval({ start: startDate, end: endDate });
  });

  const lastDisplayedDay = useMemo(
    () => displayedDays[displayedDays.length - 1],
    [displayedDays]
  );
  const firstDisplayedDay = useMemo(() => displayedDays[0], [displayedDays]);

  const loadPastDays = async () => {
    // Wait to load before loading more.
    if (isLoadingPrev || displayedDays.length === 0) return;
    setIsLoadingPrev(true);

    const firstDay = displayedDays[0];
    const endDate = subDays(firstDay, 1);
    const startDate = subDays(endDate, 15 - 1); // -1 because eachDayOfInterval is inclusive.

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
    const endDate = addDays(startDate, 15 - 1); // -1 because eachDayOfInterval is inclusive.

    // Simulate network latency if needed
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDays = eachDayOfInterval({ start: startDate, end: endDate });
    setDisplayedDays((prevDays) => [...prevDays, ...newDays]);
    setIsLoadingNext(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current && todayColumnRef.current) {
      const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>(
        "[data-radix-scroll-area-viewport]"
      );

      // if (viewport && todayColumnRef.current) {
      if (viewport) {
        // todayColumnRef.current is already checked in the outer if
        const todayCell = todayColumnRef.current;
        const containerWidth = viewport.offsetWidth;
        const cellOffsetLeft = todayCell.offsetLeft;
        const cellWidth = todayCell.offsetWidth;

        // Calculate the scroll position to center the cell
        const scrollToPosition = cellOffsetLeft - containerWidth / 2 + cellWidth / 2;

        viewport.scrollTo({
          left: scrollToPosition,
          behavior: "smooth",
        });
      }
    }
  }, []);

  return (
    <>
      <div className="flex items-center justify-center md:justify-start gap-3 mb-9 px-12">
        <div>
          <Button variant="default">JFE N1 / 清丸</Button>
        </div>

        <div>
          <Button variant="outline">JFE N3/第三清丸</Button>
        </div>

        <div>
          <Button variant="outline">扇鳳丸 </Button>
        </div>
      </div>
      <div className="flex">
        <div className="shrink">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-16 bg-primary text-primary-foreground border-l border-r border-slate-200">
                  スタッフ
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
            className="absolute top-1/2 left-2 -translate-y-1/3 transition-all w-10 h-10 hover:h-1/2 bg-slate-600/30 hover:bg-slate-600 z-50 rounded-full flex items-center justify-center cursor-pointer"
          >
            {isLoadingPrev ? (
              <Loader className="stroke-white animate-spin" />
            ) : (
              <ChevronLeft className="stroke-white" />
            )}
          </div>
          <div
            onClick={async () => await loadfutureDays()}
            className="absolute top-1/2 right-2 -translate-y-1/3 transition-all w-10 h-10 hover:h-1/2 bg-slate-600/30 hover:bg-slate-600 z-50 rounded-full flex items-center justify-center cursor-pointer"
          >
            {isLoadingNext ? (
              <Loader className="stroke-white animate-spin" />
            ) : (
              <ChevronRight className="stroke-white" />
            )}
          </div>
          <ScrollArea
            ref={scrollAreaRef}
            className="w-full whitespace-nowrap border bg-background"
            type="always"
          >
            <Table
              className="min-w-full"
              onMouseLeave={() => setHoveredColumnIndex(null)} // Reset hover when mouse leaves the table
            >
              <TableHeader>
                <TableRow>
                  {displayedDays.map((day, i) => {
                    let customStyle: string = "";
                    if (isSunday(day)) {
                      customStyle = "bg-red-500 text-white";
                    } else if (isSaturday(day)) {
                      customStyle = "bg-blue-500 text-white";
                    } else if (hoveredColumnIndex === i) {
                      customStyle = "bg-gray-100 text-foreground";
                    } else {
                      customStyle = "bg-gray-50 text-foreground";
                    }
                    return (
                      <TableHead
                        key={day.toISOString()}
                        ref={isSameDay(today, day) ? todayColumnRef : null}
                        onMouseEnter={() => setHoveredColumnIndex(i)}
                        className={`relative w-[50px] h-16 text-center border-l border-r border-slate-200 ${customStyle}`}
                      >
                        <div>{format(day, "EEE")}</div>
                        <div>{format(day, "MMM do")}</div>
                        {isSameDay(today, day) && (
                          <span className="w-full bg-green-800 text-white rounded-full absolute -bottom-2 left-0 z-30">
                            今日
                          </span>
                        )}
                      </TableHead>
                    );
                  })}
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

                      let customStyle: string = "";
                      if (isSunday(day)) {
                        hoveredColumnIndex === i
                          ? (customStyle = "bg-red-200 text-white")
                          : (customStyle = "bg-red-100 text-white");
                      } else if (isSaturday(day)) {
                        hoveredColumnIndex === i
                          ? (customStyle = "bg-blue-200 text-white")
                          : (customStyle = "bg-blue-100 text-white");
                      } else if (hoveredColumnIndex === i) {
                        customStyle = "bg-gray-100 text-foreground";
                      } else {
                        customStyle = "bg-gray-50 text-foreground";
                      }

                      if (relevantSchedule) {
                        const scheduleStartDate = startOfDay(relevantSchedule.startDate);
                        const scheduleEndDate = startOfDay(relevantSchedule.endDate);

                        if (isSameDay(currentDayStart, scheduleStartDate)) {
                          cellContent = (
                            <div className="absolute inset-0 flex items-center justify-end">
                              <span className="block w-1/2 h-1 bg-primary"></span>
                              <span className="absolute z-20 flex items-center justify-center top-0 right-0 w-full h-full">
                                <span className="rounded-full w-4 h-4 bg-primary text-primary-foreground text-xs" />
                              </span>
                            </div>
                          );
                        } else if (isSameDay(currentDayStart, scheduleEndDate)) {
                          cellContent = (
                            <div className="absolute inset-0 flex items-center justify-start">
                              <span className="block w-1/2 h-1 bg-primary"></span>
                              <span className="absolute z-20 flex items-center justify-center top-0 right-0 w-full h-full">
                                <span className="rounded-full w-4 h-4 bg-primary text-primary-foreground text-xs" />
                              </span>
                            </div>
                          );
                        } else {
                          cellContent = (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="block w-full h-1 bg-primary"></span>
                            </div>
                          );
                        }

                        return (
                          <TableCell
                            key={i + day.toISOString()}
                            onMouseEnter={() => setHoveredColumnIndex(i)}
                            className={`relative text-center p-0 ${customStyle}`}
                          >
                            <CalendarDialog cellContent={cellContent} />
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell
                            key={i + day.toISOString()}
                            onMouseEnter={() => setHoveredColumnIndex(i)}
                            className={`text-center p-0 ${customStyle}`}
                          ></TableCell>
                        );
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar className="h-4 translate-y-6" orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </>
  );
};
