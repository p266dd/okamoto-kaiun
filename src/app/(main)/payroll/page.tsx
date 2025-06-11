"use client";

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

export default function PayrollPage() {
  return (
    <div>
      <div className="px-6 sm:px-12 md:px-20 flex items-end justify-between gap-4 mb-14">
        <div className="flex gap-4">
          <Card>
            <CardContent className="flex flex-col gap-2">
              <div>
                <ShipIcon />
              </div>
              <div>
                <p className="text-lg">JFE N1 / 清丸</p>
                <p className="text-xs text-gray-400">Current Viewing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <Label>Select Ship</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="JFE N1 / 清丸" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="chef">JFE N1 / 清丸</SelectItem>
                <SelectItem value="deck">JFE N3/第三清丸</SelectItem>
                <SelectItem value="engine">扇鳳丸 </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>From</Label>
            <DatePicker handleChange={() => null} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>To</Label>
            <DatePicker handleChange={() => null} />
          </div>
        </div>
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
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
