"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { pageSchema } from "@/lib/validators";

type FormValues = z.infer<typeof pageSchema>;

type NewPageFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
};

export function NewPageForm({ action }: NewPageFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      visibility: "private",
    },
  });

  const onSubmit = handleSubmit((values) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Image is required");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append("title", values.title ?? "");
    formData.append("page_date", values.page_date);
    formData.append("caption", values.caption ?? "");
    formData.append("visibility", values.visibility);
    formData.append("image", file);

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result) {
        setError(result.error ?? null);
      }
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Transit tickets spread" {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="page_date">Page date</Label>
        <Input id="page_date" type="date" required {...register("page_date")} />
        {errors.page_date ? (
          <p className="text-xs text-red-600">{errors.page_date.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          rows={3}
          placeholder="What is on this page?"
          {...register("caption")}
        />
        {errors.caption ? (
          <p className="text-xs text-red-600">{errors.caption.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="visibility">Visibility</Label>
        <Select id="visibility" {...register("visibility")}>
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="image">Upload page image</Label>
        <Input
          ref={fileInputRef}
          id="image"
          type="file"
          accept="image/*"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create page"}
      </Button>
    </form>
  );
}
