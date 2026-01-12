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
      <div className="space-y-3">
        <div
          className="relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
          onClick={onCanvasClick}
        >
          <div className="relative h-[520px] w-full">
            <Image
              src={imageUrl}
              alt="Journal page"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-contain bg-slate-50"
            />
            <div className="absolute inset-0">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${selectedId === item.id ? "bg-emerald-600" : "bg-emerald-400"}`}
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
              {activeCoords ? (
                <span
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow"
                  style={{
                    left: `${activeCoords.x * 100}%`,
                    top: `${activeCoords.y * 100}%`,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">
            Items on this page
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            {items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left transition ${selectedId === item.id ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white hover:bg-slate-50"}`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setCoords(null);
                  }}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    {item.note ? (
                      <p className="text-xs text-slate-600">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                  {item.category ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {item.category}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="text-slate-600">
                No markers yet. Click the image to place one.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Marker details</h3>
        {!canEdit ? (
          <p className="text-sm text-slate-600">
            Sign in as the owner to add or edit markers.
          </p>
        ) : (
          <form className="mt-3 space-y-3" onSubmit={onSubmit}>
            <input type="hidden" value={pageId} {...register("page_id")} />

            <div className="space-y-1">
              <Label htmlFor="label">Label</Label>
              <Input id="label" required {...register("label")} />
              {errors.label ? (
                <p className="text-xs text-red-600">{errors.label.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" rows={3} {...register("note")} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="ticket, receipt, postcard"
                {...register("category")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="source_date">Source date</Label>
                <Input id="source_date" type="date" {...register("source_date")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="source_location">Source location</Label>
                <Input
                  id="source_location"
                  placeholder="Kyoto station"
                  {...register("source_location")}
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={pending}>
                {pending
                  ? "Saving..."
                  : selectedId
                    ? "Update marker"
                    : "Create marker"}
              </Button>
              {selectedId ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              Click anywhere on the image to set marker position. Coordinates are
              stored normalized between 0 and 1.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
