"use client";

import { ReactElement, useRef, useState, useEffect, useMemo } from "react";
import { fetchShips } from "@/app/login/actions";
import {
  setDefaultOptions,
  addDays,
  subDays,
  eachDayOfInterval,
  startOfDay,
  isWithinInterval,
  isSameDay,
  isSunday,
  isSaturday,
  format,
} from "date-fns";
import { ja } from "date-fns/locale";
import CalendarDialog from "@/components/calendar-dialog";
import { ChevronLeft, ChevronRight, Loader, RefreshCwIcon } from "lucide-react";
import { getScheduleData } from "@/app/(main)/actions/get-schedule";

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
import { Schedule, Staff } from "@/lib/prisma/generate";

// Define a type for Staff or a Separator.
type ProcessedStaffListItem = Staff | { type: "SEPARATOR"; id: string; roleName: string };

// Optional: Define a specific order for roles. Roles not in this list will be sorted alphabetically after these.
const ROLE_ORDER = ["cook", "deck", "engine"];

// Set the default locale to Japan.
setDefaultOptions({ locale: ja });

export const CalendarView = () => {
  const today = new Date();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const todayColumnRef = useRef<HTMLTableCellElement | null>(null);

  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState<boolean>(false);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);

  // State for fetched data
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [availableShips, setAvailableShips] = useState<{ id: string; name: string }[]>(
    []
  );
  const [refreshKey, setRefreshKey] = useState<number>(0); // State to trigger refresh.
  const [selectedShipId, setSelectedShipId] = useState<string | null>(
    "cmbsxmjz60000ycvb6i0b7j16"
  );

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

  const triggerDataRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const processedStaffList: ProcessedStaffListItem[] = useMemo(() => {
    // If there's no staff data at all, or no schedule data (meaning no relevant schedules for the current filters),
    // then no staff should be displayed in the context of those schedules.
    if (!staffData.length || !scheduleData.length) return [];

    // Create a set of staff IDs that have schedules in the currently filtered scheduleData.
    // Ensure staffId is not null before adding to the set.
    const staffIdsWithSchedules = new Set(
      scheduleData.map((s) => s.staffId).filter((id) => id !== null) as string[]
    );

    // Filter the initial staffData to include only those staff members present in staffIdsWithSchedules.
    const filteredStaffData = staffData.filter((staff) =>
      staffIdsWithSchedules.has(staff.id)
    );

    if (!filteredStaffData.length) return [];

    const staffByRole: Record<string, Staff[]> = filteredStaffData.reduce(
      (acc, staff) => {
        const role = staff.role || "deck"; // Default role if undefined.
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push(staff);
        return acc;
      },
      {} as Record<string, Staff[]>
    );

    // Sort roles based on ROLE_ORDER, then alphabetically.
    const sortedRoles = Object.keys(staffByRole).sort((a, b) => {
      const indexA = ROLE_ORDER.indexOf(a);
      const indexB = ROLE_ORDER.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    const result: ProcessedStaffListItem[] = [];
    sortedRoles.forEach((role, index) => {
      result.push(...staffByRole[role]);
      if (index < sortedRoles.length - 1) {
        result.push({ type: "SEPARATOR", id: `separator-${role}`, roleName: role });
      }
    });
    return result;
  }, [staffData, scheduleData]);

  // Fetch schedule data when displayedDays changes
  useEffect(() => {
    const loadShips = async () => {
      const fetchedShips = await fetchShips();
      if (fetchedShips) {
        setAvailableShips(fetchedShips);
      }
    };
    loadShips();
  }, []);

  // Fetch schedule data when displayedDays changes
  useEffect(() => {
    const fetchData = async () => {
      // Ensure we have a valid date range
      if (displayedDays.length === 0) return;

      const start = displayedDays[0];
      const end = displayedDays[displayedDays.length - 1];

      const data = await getScheduleData(start, end, selectedShipId); // Pass selectedShipId
      setStaffData(data.staff);
      setScheduleData(data.schedules);
    };
    fetchData();
  }, [displayedDays, refreshKey, selectedShipId]); // Re-fetch when the date range or refreshKey changes

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

  return (
    <>
      <div className="flex items-center justify-center md:justify-start gap-3 mb-9 px-12">
        <div>
          <Button
            className="cursor-pointer"
            onClick={() => setRefreshKey((prevKey) => prevKey + 1)}
            variant="default"
          >
            <RefreshCwIcon />
          </Button>
        </div>

        {availableShips.map((ship, i) => (
          <div key={`whip-${i}`}>
            <Button
              variant={selectedShipId === ship.id ? "default" : "outline"}
              onClick={() => setSelectedShipId(ship.id)}
            >
              {ship.name}
            </Button>
          </div>
        ))}
      </div>
      <div className="relative flex">
        <div className="relative w-1/3 sm:w-1/5 md:w-2/12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-16 bg-primary text-primary-foreground border-l border-r border-slate-200">
                  スタッフ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedStaffList.map((item) => {
                if ("type" in item && item.type === "SEPARATOR") {
                  return (
                    <TableRow key={item.id} className="h-4 bg-slate-200/70">
                      <TableCell className="font-semibold italic text-slate-700 pl-2 py-0.5 text-xs">
                        {/* You can display item.roleName here if desired, or leave it for a visual break */}
                        <span className="text-transparent">{item.roleName}</span>
                      </TableCell>
                    </TableRow>
                  );
                }
                const staff = item as Staff;
                return (
                  <TableRow key={staff.id} className="hover:bg-gray-100 h-9">
                    <TableCell className="bg-blue-100 font-medium pr-4 sm:pr-12">{`${staff.firstName} ${staff.lastName}`}</TableCell>
                  </TableRow>
                );
              })}
              {processedStaffList.length === 0 && (
                <TableRow className="hover:bg-gray-100 h-9">
                  <TableCell className="bg-blue-100 font-medium pr-4 sm:pr-12">
                    スタッフなし
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="relative w-2/3 sm:w-4/5 md:w-10/12">
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
                {processedStaffList.map((item) => {
                  if ("type" in item && item.type === "SEPARATOR") {
                    return (
                      <TableRow key={item.id} className="h-4 bg-slate-200/70">
                        <TableCell
                          colSpan={displayedDays.length}
                          className="p-0 border-x border-slate-200"
                        >
                          {/* This cell spans all date columns and is styled as a separator */}
                          <span className="text-transparent">{item.roleName}</span>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  const staff = item as Staff;
                  return (
                    <TableRow key={staff.id} className="hover:bg-gray-100 h-9">
                      {displayedDays.map((day, i) => {
                        let cellContent: ReactElement | null = null;
                        const currentDayStart = startOfDay(day);

                        // Find the relevant schedule for the current staff and day
                        const relevantSchedule = scheduleData.find(
                          (s) =>
                            s.staffId === staff.id &&
                            s.embark && // Ensure embark date exists
                            isWithinInterval(currentDayStart, {
                              start: startOfDay(s.embark),
                              end: s.desembark
                                ? startOfDay(s.desembark)
                                : addDays(startOfDay(s.embark), 365 * 2), // Use a far future date if desembark is null
                            })
                        ) as Schedule & {
                          staff: { firstName: string; lastName: string };
                        };

                        let customStyle: string = "";
                        if (isSunday(day)) {
                          customStyle =
                            hoveredColumnIndex === i ? "bg-red-200" : "bg-red-100";
                        } else if (isSaturday(day)) {
                          customStyle =
                            hoveredColumnIndex === i ? "bg-blue-200" : "bg-blue-100";
                        } else if (hoveredColumnIndex === i) {
                          customStyle = "bg-gray-100";
                        } else {
                          customStyle = "bg-gray-50";
                        }

                        if (relevantSchedule && relevantSchedule.embark) {
                          const scheduleStartDate = startOfDay(relevantSchedule.embark);
                          const scheduleEndDate = relevantSchedule.desembark
                            ? startOfDay(relevantSchedule.desembark)
                            : null;

                          if (isSameDay(currentDayStart, scheduleStartDate)) {
                            cellContent = (
                              <div className="absolute inset-0 flex items-center justify-end">
                                <span className="block w-1/2 h-1 bg-primary"></span>
                                <span className="absolute z-20 flex items-center justify-center top-0 right-0 w-full h-full">
                                  <span className="rounded-full w-4 h-4 bg-primary text-primary-foreground text-xs" />
                                </span>
                              </div>
                            );
                          } else if (
                            scheduleEndDate &&
                            isSameDay(currentDayStart, scheduleEndDate)
                          ) {
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
                              key={`${staff.id}-${day.toISOString()}-${i}-data`}
                              onMouseEnter={() => setHoveredColumnIndex(i)}
                              className={`relative text-center p-0 ${customStyle}`}
                            >
                              <CalendarDialog
                                cellContent={cellContent}
                                relevantSchedule={{
                                  ...relevantSchedule,
                                  staff: {
                                    firstName: staff.firstName,
                                    lastName: staff.lastName,
                                  },
                                }}
                                onScheduleUpdate={triggerDataRefresh}
                              />
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell
                              key={`${staff.id}-${day.toISOString()}-${i}-empty`}
                              onMouseEnter={() => setHoveredColumnIndex(i)}
                              className={`text-center p-0 ${customStyle}`}
                            ></TableCell>
                          );
                        }
                      })}
                    </TableRow>
                  );
                })}
                {processedStaffList.length === 0 && (
                  <TableRow className="hover:bg-gray-100 h-9">
                    <TableCell className="bg-blue-100 font-medium pr-4 sm:pr-12"></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar className="h-4 translate-y-6" orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </>
  );
};
