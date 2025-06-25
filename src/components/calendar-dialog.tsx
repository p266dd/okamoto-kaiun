"use client";

import { ReactElement, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { fetchShips } from "@/app/login/actions";
import { updateScheduleData } from "@/app/(main)/actions/update-schedule";

// Shadcn
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircleIcon, ShipIcon, XCircleIcon } from "lucide-react";

// Types
import { Schedule } from "@/lib/prisma/generate";

// Form Schema
const formSchema = z.object({
  shipID: z.string().trim(),
  embark: z.date().optional().nullable(),
  desembark: z.date().optional().nullable(),
  scheduleId: z.string().trim(),
});

export default function CalendarDialog({
  cellContent,
  relevantSchedule,
  onScheduleUpdate,
}: {
  cellContent: ReactElement;
  relevantSchedule: Schedule & {
    staff: {
      firstName: string;
      lastName: string;
      role?: string;
    };
  };
  onScheduleUpdate: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [ships, setShips] = useState<{ id: string; name: string }[]>([]);

  const handleChange = useCallback(() => {
    setEdit(true);
  }, [setEdit]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      shipID: relevantSchedule.shipId || "",
      embark: relevantSchedule.embark || null,
      desembark: relevantSchedule.desembark || null,
      scheduleId: relevantSchedule.id || "",
    },
  });

  const {
    formState: { isDirty },
  } = form;

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateScheduleData({
      shipID: values.shipID,
      embark: values.embark,
      desembark: values.desembark,
      scheduleId: values.scheduleId,
    })
      .then(() => {
        toast.success("Changes have been saved.");
        setEdit(false);
        onScheduleUpdate(); // Call the callback to trigger refresh in parent.
      })
      .catch((error) => {
        toast.error(error.message);
      });
    return;
  }

  useEffect(() => {
    if (isDirty) {
      handleChange();
    }

    const fetchData = async () => {
      const data = await fetchShips();
      setShips(data || []);
    };
    fetchData();
  }, [isDirty, handleChange]);

  return (
    <Dialog>
      <DialogTrigger asChild>{cellContent}</DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary">勤務詳細</DialogTitle>
          <DialogDescription className="sr-only">
            変更を編集して保存できます。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="hidden"
              {...form.register("scheduleId")}
              defaultValue={relevantSchedule.id}
            />
            <div>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                {relevantSchedule.staff.lastName + " " + relevantSchedule.staff.firstName}
              </h3>
              <div className="text-sm text-gray-400 mb-5">
                {relevantSchedule.staff?.role}
              </div>
              <div className="flex flex-col gap-3 mb-4">
                <FormField
                  control={form.control}
                  name="shipID"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        <ShipIcon className="stroke-primary" />
                        乗船した船舶
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="NFE 1" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent defaultValue="apple">
                          <SelectGroup>
                            <SelectLabel>船</SelectLabel>
                            {ships.map((ship, i) => (
                              <SelectItem key={i} value={ship.id}>
                                {ship.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex items-center gap-3 mb-9">
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="embark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>乗船</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMM do", { locale: enUS })
                                ) : (
                                  <span>日付を選ぶ</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="desembark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>下船</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MM do", { locale: enUS })
                                ) : (
                                  <span>日付を選ぶ</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mb-8 max-h-[300px] overflow-y-auto">
                <div className="flex items-center gap-6 mb-4">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    乗船中の休暇登録
                  </h3>
                  <Button size="sm" variant="outline" className="cursor-pointer">
                    <PlusCircleIcon /> 新たな不在
                  </Button>
                </div>
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>理由</TableHead>
                        <TableHead>日付</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="w-full">
                        <TableCell>
                          <span className="w-full text-wrap">機能は利用できません</span>
                        </TableCell>
                        <TableCell>{/* <DatePicker /> */}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost">
                            <XCircleIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right">
                          合計1日間
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </div>
          </form>
        </Form>
        {edit && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              変更を保存
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
