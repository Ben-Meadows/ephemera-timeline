# Timeline Visual Refresh — Design Document

**Date:** 2026-03-01
**Scope:** All timeline components and the `/timeline` page
**Approach:** Full visual redesign (Approach B) — new color system, polaroid markers, dark header, Slate Blue controls

---

## 1. Goals

- Replace the current "typewriter/sepia" aesthetic with an eclectic collage-board feel
- Apply the new brand palette throughout: Olivewood, Tuscan Red, Slate Blue, Creamy Biscotti
- Keep all existing functionality and data flow unchanged
- Improve the visual hierarchy and contrast

---

## 2. Color System

| Token | Hex | Role |
|---|---|---|
| Olivewood | `#210706` | Header bg, primary headings, heavy text |
| Tuscan Red | `#891D1A` | Dates, timeline rail, active states, CTA buttons |
| Slate Blue | `#5E657B` | Controls, secondary text, metadata |
| Creamy Biscotti | `#F1E6D2` | Page bg, card bg, text on dark surfaces |

**Retiring:** `#f5efe6`, `#8b4513`, `#5c4033`, `#2c1810`, `#d4a574`, `#8b7355`

**Typography changes:**
- Playfair Display: headings (unchanged)
- Crimson Text: body, captions, labels (replace typewriter font for most uses)
- Typewriter font: retained only for tiny stamp/badge elements (visibility labels, very small metadata)

---

## 3. Component Designs

### 3.1 Page Header (`/timeline` page header card)

- Background: `#210706` (Olivewood)
- Left-edge accent: 4px Tuscan Red (`#891D1A`) vertical bar
- Title text: Playfair Display, `#F1E6D2` (Creamy Biscotti)
- Subtitle: Crimson Text, `#F1E6D2` at 60% opacity
- "+ New Page" button: `#891D1A` fill, `#F1E6D2` text
- Controls row separator: thin Tuscan Red rule (`#891D1A` at 30%)

### 3.2 View Toggle (`timeline-view-toggle.tsx`)

- Container border: `#5E657B` at 30% opacity, Biscotti bg
- Active pill: `#5E657B` fill, `#F1E6D2` text
- Inactive: `#5E657B` text, transparent bg
- Labels: "List" / "Visual" (drop emoji prefix and uppercase)

### 3.3 Collection Filter (`timeline-filter.tsx`)

- "Filter:" label: Crimson Text, `#5E657B`
- Select: `#F1E6D2` bg, `#210706` text, `#5E657B/40` border
- Focus ring: `#5E657B`

### 3.4 Visual Timeline Container (`visual-timeline.tsx`)

- Outer container bg: `#F1E6D2` (Creamy Biscotti)
- Border: `#891D1A` at 15% opacity
- Timeline rail (horizontal line): `#891D1A` (Tuscan Red) at 60% opacity
- Month label text: Crimson Text italic, `#891D1A`
- Month tick mark: `#891D1A` at 50%
- Label header strip: `#210706` bg, `#F1E6D2` text, Tuscan Red dot instead of circle
- Scroll fade gradients: from `#F1E6D2`

### 3.5 Timeline Marker / Polaroid (`timeline-marker.tsx`)

**Shape:** Polaroid card
- Photo area: ~88×88px, square crop
- Polaroid border: 8px white on sides and top, 28px white strip at bottom
- Bottom strip: date in Crimson Text, `#891D1A` Tuscan Red, ~11px
- Polaroid background color: `#FAFAF9` (near-white)
- Drop shadow: `0 4px 12px rgba(33, 7, 6, 0.25)` (deep Olivewood shadow)
- Outline: `1px solid rgba(33, 7, 6, 0.08)`

**Random tilt (cycles by index mod 4):**
- 0: `-2deg`
- 1: `1.5deg`
- 2: `-1deg`
- 3: `2.5deg`

**Hover state:**
- Scale up: `scale(1.08)`
- Shadow deepens: `0 8px 24px rgba(33, 7, 6, 0.35)`
- Tilt straightens to `0deg` (transition: all 0.2s ease)

**Connector dot (on the timeline rail):**
- Filled circle, `#891D1A` Tuscan Red, 8px diameter

**Annotation popup (on click):**
- Background: `#210706` (Olivewood) with slight transparency
- Text: `#F1E6D2` (Creamy Biscotti)
- Title text: Playfair Display
- Date: Tuscan Red `#891D1A`
- Border/accent: thin `#891D1A` left border on the card
- Close button: Biscotti text, hover Tuscan Red

### 3.6 Page Card / List View (`page-card.tsx`)

- Card bg: `#F1E6D2`
- Border: `#891D1A` at 12% opacity
- Tape decoration: `#891D1A` at 25% opacity (subtle warm red instead of brown)
- Photo frame border/outline: near-white with Olivewood shadow
- Corner accents: `#891D1A` at 40% opacity
- Date postmark: `#891D1A` border + text
- Visibility badge: Slate Blue tint (`#5E657B` at 15% bg, `#5E657B` text)
- Title: `#210706` (Olivewood), hover: `#891D1A`
- Caption: `#5E657B` (Slate Blue)
- "View →": `#891D1A`

---

## 4. Files to Change

| File | What changes |
|---|---|
| `src/app/timeline/page.tsx` | Header card colors and structure; controls row |
| `src/components/timeline/timeline-view-toggle.tsx` | New colors + labels |
| `src/components/timeline/timeline-filter.tsx` | New colors + label font |
| `src/components/timeline/visual-timeline.tsx` | Container, rail, month labels, header strip |
| `src/components/timeline/timeline-marker.tsx` | Polaroid shape, tilt, annotation colors |
| `src/components/page/page-card.tsx` | New palette throughout |

---

## 5. Out of Scope

- No changes to data fetching, server actions, or types
- No layout restructuring (page stays same structure)
- No background textures (keeping clean)
- No changes to `/timelines` (collections management) or `/p/[id]` (page detail) in this pass
