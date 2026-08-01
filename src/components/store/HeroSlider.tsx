import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import hero1 from "@/assets/hero-sneakers.jpg";
import hero2 from "@/assets/cat-panjabi.jpg";
import hero3 from "@/assets/cat-shirt.jpg";

const slides = [
  {
    img: hero1,
    eyebrow: "New Season",
    heading: "Style in\nMotion",
    sub: "Built for everyday movement with effortless comfort.",
    cta: "Shop Sneakers",
    overlay: "from-white/80",
    textColor: "text-primary",
  },
  {
    img: hero2,
    eyebrow: "Eid Collection",
    heading: "Panjabi\nEssentials",
    sub: "Handcrafted embroidery, premium cotton, tailored for you.",
    cta: "Shop Panjabi",
    overlay: "from-white/70",
    textColor: "text-primary",
  },
  {
    img: hero3,
    eyebrow: "Best Sellers",
    heading: "Dress for\nEvery Day",
    sub: "Oxford shirts and polos built for the long run.",
    cta: "Shop Shirts",
    overlay: "from-white/70",
    textColor: "text-primary",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent(next);
      setTimeout(() => setAnimating(false), 600);
    },
    [animating],
  );

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    const id = setInterval(() => go((current + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [current, go]);

  const slide = slides[current]!;

  return (
    <div className="relative overflow-hidden">
      {/* Images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-600 ${i === current ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== current}
        >
          <img
            src={s.img}
            alt={s.heading.replace("\n", " ")}
            width={1600}
            height={640}
            className="aspect-[5/2] w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Spacer so parent knows height */}
      <img
        src={slide.img}
        alt=""
        aria-hidden
        width={1600}
        height={640}
        className="aspect-[5/2] w-full object-cover opacity-0"
      />

      {/* Gradient + text overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.overlay} via-transparent to-transparent transition-all duration-600`}
      />
      <div
        className={`absolute inset-0 flex flex-col justify-center gap-4 p-6 transition-all duration-500 sm:p-14 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
          {slide.eyebrow}
        </p>
        <h1 className="max-w-md whitespace-pre-line text-4xl font-black uppercase leading-[0.95] tracking-tight text-primary sm:text-6xl">
          {slide.heading}
        </h1>
        <p className="max-w-xs text-sm text-primary/80">{slide.sub}</p>
        <div>
          <a
            href="/"
            className="inline-block bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-sale"
          >
            {slide.cta}
          </a>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center bg-background/80 text-foreground shadow transition-colors hover:bg-background sm:left-5 sm:size-10"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center bg-background/80 text-foreground shadow transition-colors hover:bg-background sm:right-5 sm:size-10"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 transition-all duration-300 ${i === current ? "w-8 bg-sale" : "w-4 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
