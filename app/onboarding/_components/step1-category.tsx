"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitStep1 } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  STORE_CATEGORIES,
  step1Schema,
  type Step1Input,
  type StoreCategory,
} from "@/lib/schemas/onboarding";

export function Step1Category({
  defaultValues,
}: {
  defaultValues: { name: string; category: StoreCategory };
}) {
  const form = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  async function onSubmit(values: Step1Input) {
    const result = await submitStep1(values);
    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  }

  const { isSubmitting } = form.formState;
  const rootError = form.formState.errors.root?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>매장 기본 정보</CardTitle>
        <CardDescription>
          매장명과 분야를 알려주세요. 언제든 수정할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {rootError ? (
              <p className="text-sm text-destructive" role="alert">
                {rootError}
              </p>
            ) : null}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>매장명</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="예: 히든팩토리 공방"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>분야</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="분야를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STORE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "저장 중…" : "다음"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
