"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PageItem } from "@/lib/types";
import { markerSchema } from "@/lib/validators";
import type {
  CreateMarker,
  DeleteMarker,
  UpdateMarker,
} from "@/app/actions/markers";

type FormValues = z.infer<typeof markerSchema>;

type PageItemsBoardProps = {
  pageId: string;
  imageUrl: string;
  items: PageItem[];
  canEdit: boolean;
  onCreate: CreateMarker;
  onUpdate: UpdateMarker;
  onDelete: DeleteMarker;
};

export function PageItemsBoard({
  pageId,
  imageUrl,
  items,
  canEdit,
  onCreate,
  onUpdate,
  onDelete,
}: PageItemsBoardProps) {
  const router = useRouter();
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(markerSchema),
    defaultValues: {
      page_id: pageId,
      label: "",
      note: "",
      category: "",
      source_date: "",
      source_location: "",
      x: 0,
      y: 0,
    },
  });

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId],
  );

  useEffect(() => {
    if (selectedItem) {
      reset({
        page_id: pageId,
        label: selectedItem.label,
        note: selectedItem.note ?? "",
        category: selectedItem.category ?? "",
        source_date: selectedItem.source_date ?? "",
        source_location: selectedItem.source_location ?? "",
        x: selectedItem.x,
        y: selectedItem.y,
      });
    }
  }, [pageId, reset, selectedItem]);

  const activeCoords =
    coords ?? (selectedItem ? { x: selectedItem.x, y: selectedItem.y } : null);

  const onCanvasClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!canEdit) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setSelectedId(null);
    setCoords({ x, y });
    reset({
      page_id: pageId,
      label: "New item",
      note: "",
      category: "",
      source_date: "",
      source_location: "",
      x,
      y,
    });
  };

  const onSubmit = handleSubmit((values) => {
    if (!activeCoords) {
      setError("Click the image to place a marker first.");
      return;
    }
    setError(null);

    const payload = { ...values, x: activeCoords.x, y: activeCoords.y };

    startTransition(async () => {
      const result = selectedId
        ? await onUpdate({ ...payload, id: selectedId })
        : await onCreate(payload);

      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  });

  const handleDelete = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await onDelete({
        id: selectedId,
        page_id: pageId,
      });
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        setSelectedId(null);
        setCoords(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        {/* Image canvas */}
        <div
          className="relative overflow-hidden rounded-sm cursor-crosshair"
          style={{
            boxShadow: '0 4px 20px rgba(44, 24, 16, 0.1)',
            border: '4px solid #f5efe6',
            outline: '1px solid rgba(139, 69, 19, 0.15)',
          }}
          onClick={onCanvasClick}
        >
          {/* Photo corner accents */}
          <div className="absolute top-1 left-1 w-5 h-5 border-l-2 border-t-2 border-[#d4a574] opacity-60 z-10 pointer-events-none" />
          <div className="absolute top-1 right-1 w-5 h-5 border-r-2 border-t-2 border-[#d4a574] opacity-60 z-10 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-5 h-5 border-l-2 border-b-2 border-[#d4a574] opacity-60 z-10 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-5 h-5 border-r-2 border-b-2 border-[#d4a574] opacity-60 z-10 pointer-events-none" />

          <div className="relative h-[520px] w-full bg-[#e8dfd3]">
            <Image
              src={imageUrl}
              alt="Journal page"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-contain"
            />
            <div className="absolute inset-0">
              {/* Existing markers */}
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all ${
                    selectedId === item.id 
                      ? "bg-[#722f37] border-[#f5efe6] scale-125 shadow-lg" 
                      : "bg-[#8b4513] border-[#f5efe6] hover:scale-110 shadow-md"
                  }`}
                  style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                    setCoords(null);
                  }}
                >
                  <span className="sr-only">{item.label}</span>
                </button>
              ))}
              {/* Active/new marker */}
              {activeCoords && !selectedId && (
                <span
                  className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f5efe6] bg-[#d4a574] shadow-lg animate-pulse"
                  style={{
                    left: `${activeCoords.x * 100}%`,
                    top: `${activeCoords.y * 100}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Items list */}
        <div 
          className="rounded-sm bg-[#f5efe6] p-5"
          style={{
            boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
            border: '1px solid rgba(139, 69, 19, 0.1)',
          }}
        >
          <h3 className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
            ✦ Items on this page
          </h3>
          <div className="mt-4 space-y-2">
            {items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full items-start justify-between rounded-sm px-4 py-3 text-left transition-all ${
                    selectedId === item.id 
                      ? "bg-[#8b4513]/10 border border-[#8b4513]/30" 
                      : "bg-[#faf6f1] border border-transparent hover:border-[#d4a574]"
                  }`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setCoords(null);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span 
                      className={`mt-1 h-3 w-3 rounded-full ${
                        selectedId === item.id ? "bg-[#722f37]" : "bg-[#8b4513]"
                      }`} 
                    />
                    <div>
                      <p className="font-[family-name:var(--font-playfair)] font-semibold text-[#2c1810]">
                        {item.label}
                      </p>
                      {item.note && (
                        <p className="mt-0.5 font-[family-name:var(--font-crimson)] text-xs text-[#5c4033] italic">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.category && (
                    <span className="rounded-sm border border-[#d4a574] bg-[#f5efe6] px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[10px] uppercase text-[#8b4513]">
                      {item.category}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] italic">
                No markers yet. {canEdit && "Click on the image to add one."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Marker form panel */}
      <div 
        className="rounded-sm bg-[#f5efe6] p-5 h-fit lg:sticky lg:top-4"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        <h3 className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
          ✦ Marker Details
        </h3>
        
        {!canEdit ? (
          <div className="mt-4 rounded-sm border border-dashed border-[#d4a574] p-4 text-center">
            <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              Sign in as the owner to add or edit markers.
            </p>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <input type="hidden" value={pageId} {...register("page_id")} />

            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input id="label" placeholder="e.g., Train ticket" required {...register("label")} />
              {errors.label && (
                <p className="font-[family-name:var(--font-crimson)] text-xs text-[#722f37]">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" rows={2} placeholder="Story behind this item..." {...register("note")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="ticket, receipt, postcard..."
                {...register("category")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="source_date">Date</Label>
                <Input id="source_date" type="date" {...register("source_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source_location">Location</Label>
                <Input
                  id="source_location"
                  placeholder="Kyoto"
                  {...register("source_location")}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-sm border border-[#722f37]/30 bg-[#722f37]/5 px-4 py-3">
                <p className="font-[family-name:var(--font-crimson)] text-sm text-[#722f37]">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending
                  ? "Saving..."
                  : selectedId
                    ? "✦ Update"
                    : "✦ Add Marker"}
              </Button>
              {selectedId && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  Delete
                </Button>
              )}
            </div>
            
            <p className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b7355] text-center">
              Click anywhere on the image to place marker
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
