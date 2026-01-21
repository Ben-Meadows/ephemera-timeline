export type Visibility = "private" | "public" | "unlisted";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type JournalPage = {
  id: string;
  user_id: string;
  title: string | null;
  page_date: string;
  caption: string | null;
  visibility: Visibility;
  image_path: string;
  created_at: string;
  profile?: Profile | null;
};

export type PageItem = {
  id: string;
  page_id: string;
  x: number;
  y: number;
  label: string;
  note: string | null;
  category: string | null;
  source_date: string | null;
  source_location: string | null;
  created_at: string;
};

export type Timeline = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  visibility: Visibility;
  created_at: string;
};

export type PageTimeline = {
  page_id: string;
  timeline_id: string;
  created_at: string;
};

export type JournalPageWithTimelines = JournalPage & {
  timelines?: Timeline[];
};

export type TimelineWithPages = Timeline & {
  pages?: JournalPage[];
  page_count?: number;
};