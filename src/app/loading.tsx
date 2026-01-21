export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        {/* Animated stamp */}
        <div 
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#8b4513] animate-pulse"
        >
          <span className="font-[family-name:var(--font-typewriter)] text-lg text-[#8b4513]">
            ✦
          </span>
        </div>
        <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-widest text-[#8b4513]">
          Loading...
        </p>
      </div>
    </div>
  );
}
