import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-10">
      <section className="grid gap-6 rounded-2xl border border-slate-100 bg-white p-10 shadow-sm sm:grid-cols-2 sm:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Ephemera Timeline
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Tag your junk journal pages and keep a shareable visual timeline.
          </h1>
          <p className="text-lg text-slate-600">
            Upload a photo, drop markers on each ticket, receipt, or note, and
            capture the story behind every piece of paper. Built with Next.js,
            Supabase, and Tailwind.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className={buttonClasses("primary", "md")}
            >
              Start journaling
            </Link>
            <Link
              href="/timeline"
              className={buttonClasses("secondary", "md")}
            >
              View my timeline
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Supabase Auth + Postgres + Storage
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Next.js 15 App Router + server actions
            </span>
          </div>
        </div>
        <div className="grid gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-sm text-emerald-900">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-emerald-700">
              Timeline
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              Demo
            </span>
          </div>
          <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Feb 14, 2024</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                Public
              </span>
            </div>
            <div className="h-36 rounded-md bg-gradient-to-br from-emerald-100 via-white to-slate-100" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">
                Kyoto transit tickets
              </p>
              <p className="text-slate-600">
                Annotated receipts, stamps, and train tickets from the trip.
              </p>
            </div>
          </div>
          <p className="text-xs text-emerald-700">
            Annotate, categorize, and share pages with friends or keep them
            private.
          </p>
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:grid-cols-3">
        {[
          {
            title: "Auth & profiles",
            body: "Supabase email/password auth with usernames, display names, and optional avatars.",
          },
          {
            title: "Pages & storage",
            body: "Upload page images to Supabase Storage and capture date, caption, and visibility.",
          },
          {
            title: "Annotations",
            body: "Click to drop markers, edit metadata, and keep everything normalized in Postgres.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
          >
            <p className="text-sm font-semibold text-emerald-700">
              {feature.title}
            </p>
            <p className="text-sm text-slate-600">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
