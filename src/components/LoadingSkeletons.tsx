/* Lightweight skeleton placeholders for lazy-loaded sections.
   These render instantly while the real component loads, preventing
   layout shift (CLS) and giving users visual feedback. */

/** Category section skeleton — shows placeholder cards */
export function CategorySkeleton() {
  return (
    <section className="py-16 px-4" aria-label="Loading categories">
      <div className="max-w-6xl mx-auto">
        {/* Label + title */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-forest/10 rounded animate-pulse mb-3" />
          <div className="h-7 w-64 bg-forest/10 rounded animate-pulse" />
        </div>
        {/* Card grid */}
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[260px] h-[430px] rounded-2xl bg-forest/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Latest properties skeleton — shows placeholder cards */
export function LatestSkeleton() {
  return (
    <section className="py-16 px-4" aria-label="Loading latest properties">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-4 w-24 bg-forest/10 rounded animate-pulse mb-3" />
          <div className="h-7 w-48 bg-forest/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[320px] rounded-2xl bg-forest/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Blog section skeleton */
export function BlogSkeleton() {
  return (
    <section className="py-16 px-4" aria-label="Loading blog posts">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-4 w-28 bg-forest/10 rounded animate-pulse mb-3" />
          <div className="h-7 w-72 bg-forest/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="h-40 bg-forest/5 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 bg-forest/10 rounded animate-pulse" />
                <div className="h-5 w-full bg-forest/10 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-forest/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Talk to us skeleton */
export function TalkSkeleton() {
  return (
    <section className="py-16 px-4" aria-label="Loading contact section">
      <div className="max-w-4xl mx-auto text-center">
        <div className="h-4 w-32 bg-forest/10 rounded animate-pulse mx-auto mb-3" />
        <div className="h-7 w-64 bg-forest/10 rounded animate-pulse mx-auto mb-4" />
        <div className="h-4 w-96 max-w-full bg-forest/5 rounded animate-pulse mx-auto mb-8" />
        <div className="flex justify-center gap-4 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 w-40 bg-forest/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Trust badges skeleton */
export function TrustSkeleton() {
  return (
    <section className="py-12 px-4" aria-label="Loading trust badges">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4">
              <div className="h-10 w-10 rounded-full bg-forest/5 animate-pulse" />
              <div className="h-4 w-28 bg-forest/10 rounded animate-pulse" />
              <div className="h-3 w-36 bg-forest/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
