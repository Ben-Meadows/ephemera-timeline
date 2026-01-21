"use client";

import { useState } from "react";
import { PageViewMode } from "./page-view-mode";
import { PageItemsBoard } from "./page-items-board";
import { Button } from "@/components/ui/button";
import type { PageItem } from "@/lib/types";
import type {
  CreateMarker,
  DeleteMarker,
  UpdateMarker,
} from "@/app/actions/markers";

type PageContentProps = {
  pageId: string;
  imageUrl: string;
  items: PageItem[];
  canEdit: boolean;
  onCreate: CreateMarker;
  onUpdate: UpdateMarker;
  onDelete: DeleteMarker;
};

export function PageContent({
  pageId,
  imageUrl,
  items,
  canEdit,
  onCreate,
  onUpdate,
  onDelete,
}: PageContentProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-4">
      {/* Mode toggle bar */}
      {canEdit && (
        <div
          className="flex items-center justify-between rounded-sm bg-[#f5efe6] px-4 py-3"
          style={{
            boxShadow: "0 2px 8px rgba(44, 24, 16, 0.04)",
            border: "1px solid rgba(139, 69, 19, 0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider ${
                isEditing
                  ? "bg-[#8b4513]/10 text-[#8b4513]"
                  : "bg-[#2c1810]/5 text-[#5c4033]"
              }`}
            >
              {isEditing ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8b4513] animate-pulse" />
                  Edit Mode
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5c4033]" />
                  View Mode
                </>
              )}
            </span>
            <span className="font-[family-name:var(--font-crimson)] text-xs text-[#8b7355]">
              {isEditing
                ? "Click on the image to place markers"
                : "Click markers to see their details"}
            </span>
          </div>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "primary"}
            size="sm"
          >
            {isEditing ? "✓ Done Editing" : "✎ Edit Markers"}
          </Button>
        </div>
      )}

      {/* Content based on mode */}
      {isEditing && canEdit ? (
        <PageItemsBoard
          pageId={pageId}
          imageUrl={imageUrl}
          items={items}
          canEdit={canEdit}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ) : (
        <PageViewMode imageUrl={imageUrl} items={items} />
      )}
    </div>
  );
}
