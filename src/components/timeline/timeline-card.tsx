"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTimelineAction, updateTimelineAction } from "@/app/actions/timelines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { TimelineWithPages, Visibility } from "@/lib/types";

type TimelineCardProps = {
  timeline: TimelineWithPages;
};

const ICONS = ["📁", "📅", "🎄", "✈️", "🎂", "📸", "🎨", "🌸", "🏖️", "🎃", "❄️", "🌺"];
const COLORS = [
  "#8b4513", "#722f37", "#2c1810", "#5c4033", "#d4a574",
  "#6b8e23", "#4682b4", "#9370db", "#cd853f", "#dc143c",
];

export function TimelineCard({ timeline }: TimelineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState(timeline.name);
  const [description, setDescription] = useState(timeline.description || "");
  const [icon, setIcon] = useState(timeline.icon);
  const [color, setColor] = useState(timeline.color);
  const [visibility, setVisibility] = useState<Visibility>(timeline.visibility);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this timeline? Pages will not be deleted.")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    const result = await deleteTimelineAction({ id: timeline.id });
    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setError(null);
    const result = await updateTimelineAction({
      id: timeline.id,
      name,
      description: description || null,
      icon,
      color,
      visibility,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <div
        className="relative rounded-sm bg-[#f5efe6] p-5"
        style={{
          boxShadow: "2px 3px 12px rgba(44, 24, 16, 0.08)",
          border: "1px solid rgba(139, 69, 19, 0.12)",
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Timeline name"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded border text-lg flex items-center justify-center transition-all ${
                    icon === i
                      ? "border-[#8b4513] bg-[#d4a574]/20"
                      : "border-[#d4a574]/30 hover:border-[#8b4513]/50"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-[#8b4513]" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Visibility
            </label>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </Select>
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-sm bg-[#f5efe6] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: "2px 3px 12px rgba(44, 24, 16, 0.08)",
        border: "1px solid rgba(139, 69, 19, 0.12)",
      }}
    >
      {/* Icon badge */}
      <div
        className="absolute -top-3 -left-2 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md"
        style={{ backgroundColor: timeline.color }}
      >
        <span className="drop-shadow-sm">{timeline.icon}</span>
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
            {timeline.name}
          </h3>
          <span
            className="rounded-sm border px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider bg-[#f5efe6] text-[#5c4033] border-[#d4a574]"
          >
            {timeline.visibility}
          </span>
        </div>

        {timeline.description && (
          <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] line-clamp-2">
            {timeline.description}
          </p>
        )}

        <p className="mt-3 font-[family-name:var(--font-typewriter)] text-xs text-[#8b7355]">
          {timeline.page_count ?? 0} {(timeline.page_count ?? 0) === 1 ? "page" : "pages"}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/timeline?filter=${timeline.id}`}
            className="font-[family-name:var(--font-crimson)] text-sm text-[#8b4513] hover:underline"
          >
            View pages →
          </Link>
          <div className="flex-1" />
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity font-[family-name:var(--font-typewriter)] text-xs text-[#5c4033] hover:text-[#8b4513]"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity font-[family-name:var(--font-typewriter)] text-xs text-[#722f37] hover:text-red-600"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
