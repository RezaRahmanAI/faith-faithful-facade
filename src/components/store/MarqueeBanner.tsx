const messages = [
  "FREE DELIVERY on orders over ৳2,000",
  "FLASH SALE — Up to 40% OFF",
  "7-Day Easy Exchange Policy",
  "100% Authentic Products Guaranteed",
  "Cash on Delivery Available Nationwide",
  "Call Us: 09600 000 000 · 10am–10pm",
];

export function MarqueeBanner() {
  const repeated = [...messages, ...messages];

  return (
    <div className="overflow-hidden bg-sale py-2 text-sale-foreground">
      <div className="flex animate-marquee gap-0 whitespace-nowrap">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 text-xs font-bold uppercase tracking-widest">
            <span className="size-1 rounded-full bg-sale-foreground/60" aria-hidden />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
