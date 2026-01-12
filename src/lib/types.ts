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
