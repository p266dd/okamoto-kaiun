"use client";

import { ReactElement, useState } from "react";
import DatePicker from "@/components/date-picker";

// Shadcn
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PencilIcon, PlusCircleIcon, ShipIcon, XCircleIcon } from "lucide-react";

export default function CalendarDialog({ cellContent }: { cellContent: ReactElement }) {
  const [edit, setEdit] = useState(false);

  const handleChange = () => {
    setEdit(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{cellContent}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">出席報告書</DialogTitle>
          <DialogDescription className="sr-only">
            変更を編集して保存できます。
          </DialogDescription>
        </DialogHeader>
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Dhavidy Pires
          </h3>
          <div className="text-sm text-gray-400 mb-5">スタッフ</div>
          <div className="flex flex-col gap-3 mb-4">
            <Label htmlFor="date" className="px-1">
              <ShipIcon className="stroke-primary" />
              船で働
            </Label>
            <Select onValueChange={handleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="NFE 1" />
              </SelectTrigger>
              <SelectContent defaultValue="apple">
                <SelectGroup>
                  <SelectLabel>船</SelectLabel>
                  <SelectItem value="ship1">NFE 1</SelectItem>
                  <SelectItem value="ship2">NFE 2</SelectItem>
                  <SelectItem value="ship3">NFE</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 mb-9">
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                乗船
              </Label>
              <DatePicker handleChange={handleChange} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                下船
              </Label>
              <DatePicker handleChange={handleChange} />
            </div>
          </div>
          <div className="mb-8 max-h-[300px] overflow-y-auto">
            <div className="flex items-center gap-6 mb-4">
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">欠席日</h3>
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
                      <span className="w-full text-wrap">
                        子供が病気のため出席できません。
                      </span>
                    </TableCell>
                    <TableCell>
                      <DatePicker handleChange={handleChange} />
                    </TableCell>
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
        {edit && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit">変更を保存</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
