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
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        setFileName(e.dataTransfer.files[0].name);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

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
    <form onSubmit={onSubmit} className="grid gap-5">
      {/* Image upload area */}
      <div className="space-y-2">
        <Label htmlFor="image">Page Image</Label>
        <div
          className={`relative cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition-colors ${
            dragActive 
              ? 'border-[#8b4513] bg-[#8b4513]/5' 
              : 'border-[#d4a574] hover:border-[#8b4513] hover:bg-[#faf6f1]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Corner accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#d4a574] opacity-50" />

          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            required
          />
          
          {fileName ? (
            <div>
              <span className="text-2xl">📷</span>
              <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#2c1810]">
                {fileName}
              </p>
              <p className="mt-1 font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513]">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div>
              <span className="text-3xl">📄</span>
              <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                Drag and drop your journal page photo here
              </p>
              <p className="mt-1 font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513]">
                or click to browse
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="vintage-divider">
        <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#d4a574]">✦</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g., Kyoto Transit Tickets" {...register("title")} />
        {errors.title ? (
          <p className="font-[family-name:var(--font-crimson)] text-xs text-[#722f37]">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="page_date">Page Date</Label>
        <Input id="page_date" type="date" required {...register("page_date")} />
        {errors.page_date ? (
          <p className="font-[family-name:var(--font-crimson)] text-xs text-[#722f37]">{errors.page_date.message}</p>
        ) : null}
        <p className="font-[family-name:var(--font-crimson)] text-xs italic text-[#8b7355]">
          When were these items collected?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption <span className="font-normal text-[#8b7355]">(optional)</span></Label>
        <Textarea
          id="caption"
          rows={3}
          placeholder="Describe what's on this page..."
          {...register("caption")}
        />
        {errors.caption ? (
          <p className="font-[family-name:var(--font-crimson)] text-xs text-[#722f37]">{errors.caption.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select id="visibility" {...register("visibility")}>
          <option value="private">🔒 Private — Only you can see</option>
          <option value="public">🌍 Public — Anyone can view</option>
          <option value="unlisted">🔗 Unlisted — Only with link</option>
        </Select>
      </div>

      {error ? (
        <div 
          className="rounded-sm border border-[#722f37]/30 bg-[#722f37]/5 px-4 py-3"
        >
          <p className="font-[family-name:var(--font-crimson)] text-sm text-[#722f37]">{error}</p>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Preserving..." : "✦ Create Page"}
      </Button>
    </form>
  );
}
