"use client";

import { z } from "zod/v4";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createStaff } from "./create-staff";
import { updateStaff } from "./updateStaff";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilIcon, PlusCircleIcon } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(3, "Too short, should  be at least 3 characters").trim(),
  lastName: z.string().min(3, "Too short, should  be at least 3 characters").trim(),
  email: z.email(),
  phone: z.string().min(8, "Too short, should  be at least 8 characters").trim(),
  role: z.string().min(4, "Too short, should  be at least 4 characters").trim(),
  salary: z.string().trim(),
  code: z.string().min(6, "Too short, should  be at least 6 characters").trim(),
});

import { StaffInterface } from "./page";

export default function StaffForm({
  edit,
  setEdit,
}: {
  edit: StaffInterface | null;
  setEdit: React.Dispatch<React.SetStateAction<StaffInterface | null>>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: edit ? edit.firstName : "",
      lastName: edit ? edit.lastName : "",
      email: edit ? edit.email : "",
      phone: edit ? edit.phone : "",
      role: edit ? edit.role : "",
      salary: edit ? edit.salary : "",
      code: edit ? edit.code : "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (edit) {
      updateStaff(edit.id, { ...values, salary: parseInt(values.salary.toString()) })
        .then(() => {
          toast.success("Changes have been saved.");
          setEdit(null);
        })
        .catch((error) => {
          toast.error("An error occured.");
          setErrorMessage(error.message);
        });

      mutate("fetchStaff");

      return;
    }

    createStaff({ ...values, salary: parseInt(values.salary.toString()) })
      .then(() => {
        toast.success("New staff has been added.");
        form.reset();
      })
      .catch((error) => {
        toast.error("An error occured.");
        setErrorMessage(error.message);
      });

    mutate("fetchStaff");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-start gap-4 flex-wrap">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dhavidy" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Pires" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-start gap-4 flex-wrap">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full sm:flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="090 1234 5678" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="6 digit code" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose role" {...field} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="deck">Deck</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input placeholder="¥ Hourly salary" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription>
              <p>{errorMessage}.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-5 my-9">
          {edit ? (
            <Button type="submit" variant="success">
              <PencilIcon /> Save Changes
            </Button>
          ) : (
            <Button type="submit">
              <PlusCircleIcon /> Add New Staff
            </Button>
          )}
          <Button variant="outline" type="button" onClick={() => setEdit(null)}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
