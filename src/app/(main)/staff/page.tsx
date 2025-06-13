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
  TableCaption,
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
import { EllipsisIcon, PencilIcon, TrashIcon } from "lucide-react";

export interface StaffInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  salary: string;
  code: string;
}

export default function StaffPage() {
  const [edit, setEdit] = useState<StaffInterface | null>(null);

  const { data, error, isLoading } = useSWR("fetchStaff", getStaff);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-6 sm:px-12 md:px-20">
        <StaffForm edit={edit} setEdit={setEdit} />
      </div>
      <div className="px-6 sm:px-12 md:px-20 mb-12 sm:mb-20">
        <Table>
          <TableCaption className="text-left">A list of all staff members.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead className="text-right w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data &&
              data.map((staff, i) => (
                <TableRow key={i}>
                  <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.code}</TableCell>
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
                            deleteStaff(staff.id).then((_r) =>
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
