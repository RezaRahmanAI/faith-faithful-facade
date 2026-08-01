import catPanjabi from "@/assets/cat-panjabi.jpg";
import catShirt from "@/assets/cat-shirt.jpg";
import catTshirt from "@/assets/cat-tshirt.jpg";
import catPants from "@/assets/cat-pants.jpg";
import catAttar from "@/assets/cat-attar.jpg";
import catSneakers from "@/assets/cat-sneakers.jpg";

export type Product = {
  slug: string;
  name: string;
  cat: string;
  price: number;
  old: number;
  img: string;
  gallery: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviews: number;
  sku: string;
  description: string;
  details: string[];
};

const clothingSizes = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    slug: "embroidered-cotton-panjabi",
    name: "Embroidered Cotton Panjabi",
    cat: "Panjabi",
    price: 1890,
    old: 2450,
    img: catPanjabi,
    gallery: [catPanjabi, catShirt, catTshirt],
    sizes: clothingSizes,
    colors: [
      { name: "Olive", hex: "#6b7a34" },
      { name: "Ink Black", hex: "#1c1c1c" },
      { name: "Off White", hex: "#efe9dd" },
    ],
    rating: 4.8,
    reviews: 126,
    sku: "NX-PNJ-1890",
    description:
      "A softly structured panjabi cut from breathable cotton, finished with a hand-guided chest embroidery and a mandarin collar. Tailored for a relaxed regular fit that drapes cleanly without clinging.",
    details: [
      "100% combed cotton, pre-shrunk",
      "Mandarin collar with 4-button placket",
      "Side slits for easy movement",
      "Machine wash cold, tumble dry low",
    ],
  },
  {
    slug: "oxford-formal-shirt-navy",
    name: "Oxford Formal Shirt — Navy",
    cat: "Shirt",
    price: 1290,
    old: 1650,
    img: catShirt,
    gallery: [catShirt, catTshirt, catPants],
    sizes: clothingSizes,
    colors: [
      { name: "Navy", hex: "#1f3560" },
      { name: "Sky", hex: "#a8c4e0" },
      { name: "White", hex: "#f5f5f2" },
    ],
    rating: 4.6,
    reviews: 84,
    sku: "NX-SHT-1290",
    description:
      "A dependable oxford shirt with a button-down collar and a mid-weight weave that holds its shape through a full working day. Slim through the body, easy across the shoulders.",
    details: [
      "Yarn-dyed oxford cotton",
      "Button-down collar, single chest pocket",
      "Reinforced side gussets",
      "Machine wash warm, warm iron",
    ],
  },
  {
    slug: "premium-cotton-tee-charcoal",
    name: "Premium Cotton Tee — Charcoal",
    cat: "T-shirt",
    price: 690,
    old: 950,
    img: catTshirt,
    gallery: [catTshirt, catShirt, catPanjabi],
    sizes: clothingSizes,
    colors: [
      { name: "Charcoal", hex: "#3a3d42" },
      { name: "Sand", hex: "#d8c7ab" },
      { name: "Black", hex: "#141414" },
    ],
    rating: 4.7,
    reviews: 231,
    sku: "NX-TEE-0690",
    description:
      "A heavyweight everyday tee in 190 GSM cotton with a ribbed crew neck that resists stretching. Cut straight through the body so it layers without bunching.",
    details: [
      "190 GSM ring-spun cotton",
      "Ribbed crew neck, shoulder-to-shoulder taping",
      "Side-seamed, no twist",
      "Machine wash cold, wash inside out",
    ],
  },
  {
    slug: "slim-fit-chino-trouser",
    name: "Slim Fit Chino Trouser",
    cat: "Pant & Trouser",
    price: 1490,
    old: 1990,
    img: catPants,
    gallery: [catPants, catShirt, catSneakers],
    sizes: ["30", "32", "34", "36", "38"],
    colors: [
      { name: "Stone", hex: "#c8bda6" },
      { name: "Indigo", hex: "#33445e" },
      { name: "Khaki", hex: "#9a8a63" },
    ],
    rating: 4.5,
    reviews: 68,
    sku: "NX-TRS-1490",
    description:
      "A slim-tapered chino in stretch twill that moves with you. Sits at the natural waist with a clean break at the ankle.",
    details: [
      "98% cotton, 2% elastane twill",
      "Slim taper through the leg",
      "Two slant pockets, two welt back pockets",
      "Machine wash cold, hang dry",
    ],
  },
  {
    slug: "amber-oud-attar-12ml",
    name: "Amber Oud Attar — 12ml",
    cat: "Attar",
    price: 850,
    old: 1200,
    img: catAttar,
    gallery: [catAttar, catPanjabi, catShirt],
    sizes: ["6ml", "12ml", "25ml"],
    colors: [
      { name: "Amber Oud", hex: "#a5561f" },
      { name: "White Musk", hex: "#e6ddd2" },
      { name: "Rose Taif", hex: "#a8455a" },
    ],
    rating: 4.9,
    reviews: 312,
    sku: "NX-ATR-0850",
    description:
      "An alcohol-free oil blend led by warm amber and smoky oud, settling into a soft resinous base. A little goes far — one dab lasts through the day.",
    details: [
      "Alcohol-free concentrated oil",
      "Top: amber · Heart: oud · Base: resin, musk",
      "Roll-on glass bottle",
      "Store away from direct sunlight",
    ],
  },
  {
    slug: "court-low-sneaker-white",
    name: "Court Low Sneaker — White",
    cat: "Sneakers",
    price: 2390,
    old: 3100,
    img: catSneakers,
    gallery: [catSneakers, catPants, catTshirt],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: [
      { name: "White", hex: "#f2f2ef" },
      { name: "Grey", hex: "#9d9d9d" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    rating: 4.6,
    reviews: 97,
    sku: "NX-SNK-2390",
    description:
      "A clean court silhouette on a cushioned rubber cup sole. Full-grain upper with suede overlays that soften with wear.",
    details: [
      "Full-grain leather upper with suede trim",
      "Cushioned EVA footbed",
      "Vulcanised rubber cup sole",
      "Wipe clean with a damp cloth",
    ],
  },
  {
    slug: "mandarin-collar-panjabi",
    name: "Mandarin Collar Panjabi",
    cat: "Panjabi",
    price: 2150,
    old: 2800,
    img: catPanjabi,
    gallery: [catPanjabi, catAttar, catShirt],
    sizes: clothingSizes,
    colors: [
      { name: "Deep Green", hex: "#33513c" },
      { name: "Maroon", hex: "#5c2230" },
      { name: "Sand", hex: "#d5c6ad" },
    ],
    rating: 4.7,
    reviews: 54,
    sku: "NX-PNJ-2150",
    description:
      "A minimal panjabi with a raised mandarin collar and concealed placket, cut in a fine cotton-linen blend that keeps its crispness in humid weather.",
    details: [
      "Cotton-linen blend",
      "Concealed button placket",
      "Straight hem with side slits",
      "Gentle machine wash, cool iron",
    ],
  },
  {
    slug: "everyday-polo-olive",
    name: "Everyday Polo — Olive",
    cat: "Polo Shirt",
    price: 990,
    old: 1350,
    img: catTshirt,
    gallery: [catTshirt, catPants, catSneakers],
    sizes: clothingSizes,
    colors: [
      { name: "Olive", hex: "#5f6b3c" },
      { name: "Navy", hex: "#26354f" },
      { name: "Grey Melange", hex: "#a3a3a0" },
    ],
    rating: 4.4,
    reviews: 41,
    sku: "NX-POL-0990",
    description:
      "A pique polo with a ribbed collar that stays flat and a two-button placket. Regular fit, built for daily rotation.",
    details: [
      "220 GSM cotton pique",
      "Ribbed collar and cuffs",
      "Two-button placket with spare button",
      "Machine wash cold",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
