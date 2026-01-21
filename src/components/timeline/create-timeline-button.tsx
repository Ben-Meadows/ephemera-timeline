"use client";

import { useState } from "react";
import { createTimelineAction } from "@/app/actions/timelines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Visibility } from "@/lib/types";

const ICONS = ["📁", "📅", "🎄", "✈️", "🎂", "📸", "🎨", "🌸", "🏖️", "🎃", "❄️", "🌺"];
const COLORS = [
  "#8b4513", "#722f37", "#2c1810", "#5c4033", "#d4a574",
  "#6b8e23", "#4682b4", "#9370db", "#cd853f", "#dc143c",
];

export function CreateTimelineButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("#8b4513");
  const [visibility, setVisibility] = useState<Visibility>("private");

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("📁");
    setColor("#8b4513");
    setVisibility("private");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createTimelineAction({
      name,
      description: description || null,
      icon,
      color,
      visibility,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    } else {
      resetForm();
      setIsOpen(false);
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        + New Timeline
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-md rounded-sm bg-[#f5efe6] p-6 mx-4"
        style={{
          boxShadow: "0 8px 32px rgba(44, 24, 16, 0.2)",
          border: "1px solid rgba(139, 69, 19, 0.2)",
        }}
      >
        {/* Decorative tape */}
        <div
          className="absolute -top-3 left-8 h-6 w-16"
          style={{
            background: "linear-gradient(180deg, rgba(212, 165, 116, 0.7) 0%, rgba(212, 165, 116, 0.5) 100%)",
            transform: "rotate(-2deg)",
          }}
        />

        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2c1810] mb-4">
          Create New Timeline
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Holiday Memories"
              required
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#5c4033] mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this timeline for?"
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
              <option value="private">Private - Only you can see</option>
              <option value="unlisted">Unlisted - Anyone with link</option>
              <option value="public">Public - Visible to everyone</option>
            </Select>
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Timeline"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
