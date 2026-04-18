"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitStep2 } from "@/app/onboarding/actions";
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
import { getSigunguList, SIDO_LIST } from "@/lib/data/korea-regions";
import {
  step2Schema,
  type Step2Input,
  type Step2Output,
} from "@/lib/schemas/onboarding";

type Step2Defaults = {
  region_sido: string;
  region_sigungu: string;
  address_detail: string;
  tagline: string;
  phone: string;
  instagram_url: string;
  naver_place_url: string;
  kakao_channel_url: string;
};

export function Step2Details({
  defaultValues,
}: {
  defaultValues: Step2Defaults;
}) {
  const form = useForm<Step2Input, unknown, Step2Output>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      region_sido: defaultValues.region_sido || SIDO_LIST[0] || "",
      region_sigungu: defaultValues.region_sigungu,
      address_detail: defaultValues.address_detail,
      tagline: defaultValues.tagline,
      phone: defaultValues.phone,
      instagram_url: defaultValues.instagram_url,
      naver_place_url: defaultValues.naver_place_url,
      kakao_channel_url: defaultValues.kakao_channel_url,
    },
  });

  const selectedSido = useWatch({
    control: form.control,
    name: "region_sido",
  });
  const sigunguOptions = getSigunguList(selectedSido ?? "");

  async function onSubmit(values: Step2Output) {
    const result = await submitStep2(values);
    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  }

  const { isSubmitting } = form.formState;
  const rootError = form.formState.errors.root?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>매장 상세</CardTitle>
        <CardDescription>
          지역과 소개글, 연결하고 싶은 채널을 입력하세요. (연락 채널은 선택)
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="region_sido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시/도</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("region_sigungu", "", {
                          shouldValidate: false,
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIDO_LIST.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region_sigungu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시/군/구</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={sigunguOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sigunguOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세주소 (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="예: 불당동 123-4, 2층"
                      maxLength={200}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>한 줄 소개 (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="예: 세상에 하나뿐인 수제 레진 공방"
                      maxLength={80}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="예: 010-1234-5678"
                      maxLength={30}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>인스타그램 URL (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://instagram.com/your_shop"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="naver_place_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>네이버 플레이스 URL (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://naver.me/..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kakao_channel_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카카오 채널 URL (선택)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://pf.kakao.com/..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "저장 중…" : "다음"}
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full"
              >
                <Link href="/onboarding?step=1">이전</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
