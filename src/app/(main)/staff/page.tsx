"use client";

import { useState } from "react";
import StaffForm from "./staff-form";

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

export interface Staff {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  salary: number;
  code: string;
}

export default function StaffPage() {
  const [edit, setEdit] = useState<Staff | null>(null);

  return (
    <div>
      <div className="px-6 sm:px-12 md:px-20">
        <StaffForm edit={edit} />
      </div>
      <div className="px-6 sm:px-12 md:px-20">
        <Table>
          <TableCaption>A list of all staff members.</TableCaption>
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
            <TableRow>
              <TableCell>Dhavidy</TableCell>
              <TableCell>dhavidy@email.com</TableCell>
              <TableCell>090 000 0000</TableCell>
              <TableCell>012345</TableCell>
              <TableCell>Chef</TableCell>
              <TableCell>3290 Y</TableCell>
              <TableCell className="text-right w-12">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PencilIcon /> Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <TrashIcon /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
