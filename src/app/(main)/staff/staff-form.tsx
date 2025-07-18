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
import { SaveIcon, PlusCircleIcon } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  ship: z.string().optional(),
  phone: z.string().trim(),
  role: z.string().trim(),
  salary: z.string(),
  code: z.string().min(6, "6桁番号を設定してください").trim(),
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
      firstName: edit ? edit?.firstName : "",
      lastName: edit ? edit?.lastName : "",
      ship: edit ? edit?.ship?.id : "",
      phone: edit ? edit?.phone : "",
      role: edit ? edit?.role : "",
      salary: edit ? String(edit?.salary) : "",
      code: edit ? edit?.code : "",
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
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>姓</FormLabel>
                <FormControl>
                  <Input placeholder="" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>名</FormLabel>
                <FormControl>
                  <Input placeholder="" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-start gap-4 flex-wrap">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>電話番号</FormLabel>
                <FormControl>
                  <Input placeholder="" autoComplete="off" {...field} />
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
                <FormLabel>社員番号</FormLabel>
                <FormControl>
                  <Input
                    placeholder="6桁番号を設定してください"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="ship"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>船舶</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="船舶を選択" {...field} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="b14fe6c3-4f4c-4492-9c1d-2dad1407db34">
                      JFE N1 / 清丸
                    </SelectItem>
                    <SelectItem value="797a3a0c-52d8-4ff7-a36f-95bf41a640bc">
                      JFE N3 / 第三清丸
                    </SelectItem>
                    <SelectItem value="92885bee-e9e4-4140-84b8-0bc618e4467d">
                      扇鳳丸
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>所属</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="所属部署を選択" {...field} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="司厨部">司厨部</SelectItem>
                    <SelectItem value="甲板部">甲板部</SelectItem>
                    <SelectItem value="機関部">機関部</SelectItem>
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
                <FormLabel>日給</FormLabel>
                <FormControl>
                  <Input placeholder="¥" autoComplete="off" {...field} />
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
            <>
              <Button type="submit" variant="success">
                <SaveIcon /> 変更を保存
              </Button>
              <Button variant="outline" type="button" onClick={() => setEdit(null)}>
                キャンセル
              </Button>
            </>
          ) : (
            <Button type="submit">
              <PlusCircleIcon /> 追加
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
