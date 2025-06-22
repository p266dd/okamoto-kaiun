"use client";

import { useState } from "react";
import StaffForm from "./staff-form";
import useSWR, { mutate } from "swr";
import { getStaff } from "./get-staff";
import { deleteStaff } from "./delete-staff";
import { toast } from "sonner";

// Shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon, LoaderCircleIcon, PencilIcon, TrashIcon } from "lucide-react";

export interface StaffInterface {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  role: string;
  salary: string;
  code: string;
  ship: {
    id: string;
    name: string;
  };
}

export default function StaffPage() {
  const [edit, setEdit] = useState<StaffInterface | null>(null);

  const { data, error, isLoading } = useSWR("fetchStaff", getStaff);

  if (error) return <div>Failed to load!</div>;
  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-3">
        <LoaderCircleIcon className="animate-spin" />
        <span>Loading...</span>
      </div>
    );

  console.log(data);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-6 sm:px-12 md:px-20">
        <StaffForm edit={edit} setEdit={setEdit} />
      </div>
      <div className="px-6 sm:px-12 md:px-20 mb-12 sm:mb-20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>社員番号</TableHead>
              <TableHead>船舶</TableHead>
              <TableHead>所属</TableHead>
              <TableHead>日給</TableHead>
              <TableHead className="text-right w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data &&
              data.map((staff, i) => (
                <TableRow key={i}>
                  <TableCell>{`${staff.lastName} ${staff.firstName}`}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.code}</TableCell>
                  <TableCell>{staff?.ship?.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>¥ {`${staff.salary}`}</TableCell>
                  <TableCell className="text-right w-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>オプション</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEdit(staff)}>
                          <PencilIcon /> スタッフを編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            deleteStaff(staff.id).then(() =>
                              toast.success("Staff has been deleted.")
                            );
                            mutate("fetchStaff");
                          }}
                        >
                          <TrashIcon /> スタッフを削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
