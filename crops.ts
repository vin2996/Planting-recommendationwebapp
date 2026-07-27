import { EXTRA_CROPS } from "./crops.extra";
import { FRUIT_CROPS } from "./crops.fruits";
import { MORE_CROPS } from "./crops.more";



export type SoilType = "loam" | "clay" | "sandy" | "silty" | "peaty" | "chalky";

export interface Soil {
  id: SoilType;
  name: string;
  emoji: string;
  description: string;
}

export const SOILS: Soil[] = [
  { id: "loam", name: "Loam", emoji: "🟫", description: "Balanced, dark and crumbly. The gold standard." },
  { id: "clay", name: "Clay", emoji: "🟤", description: "Heavy, sticky when wet, holds water well." },
  { id: "sandy", name: "Sandy", emoji: "🟡", description: "Gritty, drains fast, warms quickly." },
  { id: "silty", name: "Silty", emoji: "⬜", description: "Smooth, soft, fertile and moisture retaining." },
  { id: "peaty", name: "Peaty", emoji: "⬛", description: "Dark and spongy, acidic, rich in organic matter." },
  { id: "chalky", name: "Chalky", emoji: "⚪", description: "Stony and alkaline, drains freely." },
];

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  season: string;
  daysToHarvest: string;
  yield: string;
  soils: SoilType[];
  tempMin: number; // avg °C
  tempMax: number;
  rainMin: number; // mm over 7-day forecast
  rainMax: number;
  reason: string;
  steps: string[];
  water: string;
  pests: string[];
  harvest: string;
}

const BASE_CROPS: Crop[] = [
  {
    id: "maize",
    name: "Maize (Corn)",
    emoji: "🌽",
    gradient: "from-amber-300 to-yellow-500",
    season: "Warm season",
    daysToHarvest: "90–120 days",
    yield: "3–6 t/ha",
    soils: ["loam", "silty", "sandy"],
    tempMin: 18, tempMax: 32, rainMin: 10, rainMax: 120,
    reason: "Thrives in warm weather with moderate rainfall and well-drained soil.",
    steps: [
      "Plough and prepare a fine, weed-free seedbed.",
      "Plant seeds 3–5 cm deep, 25 cm apart in rows 75 cm apart.",
      "Apply nitrogen fertiliser 4–6 weeks after emergence.",
      "Weed twice: at 3 weeks and 6 weeks after planting.",
    ],
    water: "Needs steady moisture, especially at tasselling. About 25 mm/week.",
    pests: ["Fall armyworm", "Stem borer", "Aphids"],
    harvest: "Cobs are ready when husks turn brown and kernels are firm.",
  },
  {
    id: "rice",
    name: "Rice",
    emoji: "🌾",
    gradient: "from-lime-300 to-emerald-500",
    season: "Wet season",
    daysToHarvest: "100–150 days",
    yield: "4–7 t/ha",
    soils: ["clay", "silty"],
    tempMin: 20, tempMax: 35, rainMin: 60, rainMax: 400,
    reason: "Loves heavy, water-retentive soils and high rainfall.",
    steps: [
      "Level the field and build small bunds to hold water.",
      "Soak seeds 24 hours, then broadcast or transplant seedlings.",
      "Keep 5 cm of standing water through tillering.",
      "Top-dress nitrogen at tillering and panicle initiation.",
    ],
    water: "Keep flooded until 2 weeks before harvest.",
    pests: ["Stem borer", "Brown planthopper", "Rice blast"],
    harvest: "Grains turn golden and 80% of the panicle bends over.",
  },
  {
    id: "beans",
    name: "Common Beans",
    emoji: "🫘",
    gradient: "from-rose-300 to-red-500",
    season: "Cool to warm",
    daysToHarvest: "60–90 days",
    yield: "1–2 t/ha",
    soils: ["loam", "silty", "sandy"],
    tempMin: 15, tempMax: 28, rainMin: 15, rainMax: 90,
    reason: "Quick, hardy legume that fixes nitrogen and fits short rains.",
    steps: [
      "Prepare a fine seedbed free of weeds.",
      "Plant 3–4 cm deep, 10 cm apart in rows 50 cm apart.",
      "Weed at 2 and 4 weeks after emergence.",
      "Support climbing varieties with stakes.",
    ],
    water: "Moderate — avoid waterlogging. 20 mm/week is plenty.",
    pests: ["Bean fly", "Aphids", "Rust"],
    harvest: "Pods dry and rattle, or pick green for fresh beans.",
  },
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    gradient: "from-red-300 to-rose-500",
    season: "Warm season",
    daysToHarvest: "70–100 days",
    yield: "20–40 t/ha",
    soils: ["loam", "sandy", "silty"],
    tempMin: 18, tempMax: 30, rainMin: 5, rainMax: 60,
    reason: "High-value crop for warm days and light, well-drained soils.",
    steps: [
      "Raise seedlings in a nursery for 4–5 weeks.",
      "Transplant to well-composted beds, 60 cm apart.",
      "Stake and prune to a single stem for larger fruit.",
      "Mulch to keep moisture even.",
    ],
    water: "Deep watering 2–3× weekly. Avoid wetting leaves.",
    pests: ["Whitefly", "Tuta absoluta", "Blight"],
    harvest: "Pick when fruit is fully coloured but still firm.",
  },
  {
    id: "cassava",
    name: "Cassava",
    emoji: "🥔",
    gradient: "from-yellow-200 to-amber-500",
    season: "Year-round",
    daysToHarvest: "8–12 months",
    yield: "15–25 t/ha",
    soils: ["sandy", "loam"],
    tempMin: 20, tempMax: 35, rainMin: 0, rainMax: 200,
    reason: "Extremely drought-tolerant staple for light, poor soils.",
    steps: [
      "Take 25 cm stem cuttings from healthy plants.",
      "Plant slanting on ridges, 1 m × 1 m spacing.",
      "Weed regularly for the first 3 months.",
      "Roots mature slowly — harvest as needed.",
    ],
    water: "Very forgiving. Rainfall alone is usually enough.",
    pests: ["Cassava mosaic virus", "Mealybug"],
    harvest: "Lift roots when leaves yellow, from 8 months onwards.",
  },
  {
    id: "sweet_potato",
    name: "Sweet Potato",
    emoji: "🍠",
    gradient: "from-orange-300 to-amber-600",
    season: "Warm season",
    daysToHarvest: "90–150 days",
    yield: "8–15 t/ha",
    soils: ["sandy", "loam"],
    tempMin: 18, tempMax: 32, rainMin: 5, rainMax: 100,
    reason: "Vigorous vine that suppresses weeds and tolerates poor soils.",
    steps: [
      "Prepare ridges 30 cm high.",
      "Plant vine cuttings 30 cm apart along the ridge.",
      "Keep weed-free for the first 6 weeks.",
    ],
    water: "Moderate. Reduce watering close to harvest.",
    pests: ["Sweet potato weevil"],
    harvest: "Dig up tubers 3–5 months after planting.",
  },
  {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    gradient: "from-amber-200 to-yellow-600",
    season: "Cool season",
    daysToHarvest: "110–140 days",
    yield: "2–5 t/ha",
    soils: ["loam", "clay", "silty"],
    tempMin: 10, tempMax: 24, rainMin: 20, rainMax: 100,
    reason: "Best in cool, moist conditions on medium-heavy soils.",
    steps: [
      "Prepare a fine, firm seedbed.",
      "Drill seed 3 cm deep at 100 kg/ha.",
      "Top-dress nitrogen at tillering.",
    ],
    water: "Rainfall is normally enough in cool seasons.",
    pests: ["Rust", "Aphids"],
    harvest: "Cut when straw is golden and grain is hard.",
  },
  {
    id: "onion",
    name: "Onion",
    emoji: "🧅",
    gradient: "from-purple-200 to-pink-400",
    season: "Cool to warm",
    daysToHarvest: "90–150 days",
    yield: "15–25 t/ha",
    soils: ["loam", "silty", "sandy"],
    tempMin: 13, tempMax: 28, rainMin: 5, rainMax: 60,
    reason: "Reliable cash crop that suits dry finishes for good storage.",
    steps: [
      "Raise seedlings for 6 weeks.",
      "Transplant 10 cm apart in beds.",
      "Weed by hand — shallow roots dislike disturbance.",
    ],
    water: "Consistent water; stop watering 2 weeks before harvest.",
    pests: ["Thrips", "Downy mildew"],
    harvest: "Tops fall over and dry — lift and cure in shade.",
  },
  {
    id: "cabbage",
    name: "Cabbage",
    emoji: "🥬",
    gradient: "from-green-200 to-lime-500",
    season: "Cool season",
    daysToHarvest: "70–120 days",
    yield: "30–50 t/ha",
    soils: ["loam", "silty", "clay"],
    tempMin: 12, tempMax: 24, rainMin: 15, rainMax: 90,
    reason: "Heavy feeder that loves cool weather and fertile soils.",
    steps: [
      "Raise seedlings in a nursery for 4–5 weeks.",
      "Transplant 45 cm apart on well-composted beds.",
      "Water deeply and mulch.",
    ],
    water: "Regular, deep watering. Do not let plants wilt.",
    pests: ["Diamondback moth", "Aphids"],
    harvest: "Cut when heads feel firm and solid.",
  },
  {
    id: "groundnut",
    name: "Groundnut",
    emoji: "🥜",
    gradient: "from-amber-200 to-orange-500",
    season: "Warm season",
    daysToHarvest: "100–140 days",
    yield: "1–2 t/ha",
    soils: ["sandy", "loam"],
    tempMin: 20, tempMax: 32, rainMin: 15, rainMax: 120,
    reason: "Nitrogen-fixing legume that thrives in light, sandy soils.",
    steps: [
      "Shell seeds just before planting.",
      "Plant 5 cm deep, 15 cm apart in rows 45 cm apart.",
      "Earth-up around plants at flowering.",
    ],
    water: "Sensitive to drought at flowering and pod-fill.",
    pests: ["Aphids", "Leaf spot"],
    harvest: "Lift plants when lower leaves yellow; cure pods in shade.",
  },
  {
    id: "sorghum",
    name: "Sorghum",
    emoji: "🌾",
    gradient: "from-orange-200 to-red-500",
    season: "Warm season",
    daysToHarvest: "100–140 days",
    yield: "2–4 t/ha",
    soils: ["sandy", "loam", "clay"],
    tempMin: 20, tempMax: 35, rainMin: 5, rainMax: 100,
    reason: "Very drought-tolerant grain for hot, dry regions.",
    steps: [
      "Plant 2–3 cm deep in rows 60 cm apart.",
      "Thin to one plant every 15 cm.",
      "Bird-scare as heads ripen.",
    ],
    water: "Minimal — one of the most drought-hardy cereals.",
    pests: ["Shoot fly", "Birds"],
    harvest: "Cut heads when grain is hard and no longer milky.",
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    gradient: "from-yellow-100 to-amber-400",
    season: "Cool season",
    daysToHarvest: "80–120 days",
    yield: "20–35 t/ha",
    soils: ["loam", "silty", "peaty"],
    tempMin: 10, tempMax: 22, rainMin: 20, rainMax: 100,
    reason: "Cool-season staple that likes deep, loose, acidic soils.",
    steps: [
      "Plant certified seed tubers 10 cm deep on ridges.",
      "Earth-up twice as plants grow.",
      "Rotate at least every 3 years to avoid disease.",
    ],
    water: "Even moisture prevents cracked tubers.",
    pests: ["Late blight", "Colorado beetle"],
    harvest: "Lift 2 weeks after tops die back.",
  },
];

export type CropCategory =
  | "grain"
  | "legume"
  | "root"
  | "vegetable"
  | "fruit"
  | "cash"
  | "herb"
  | "nut";

export const CATEGORIES: { id: CropCategory; label: string; emoji: string }[] = [
  { id: "grain", label: "Grains", emoji: "🌾" },
  { id: "legume", label: "Legumes", emoji: "🫘" },
  { id: "root", label: "Roots & tubers", emoji: "🥔" },
  { id: "vegetable", label: "Vegetables", emoji: "🥬" },
  { id: "fruit", label: "Fruits", emoji: "🍎" },
  { id: "herb", label: "Herbs & spices", emoji: "🌿" },
  { id: "nut", label: "Nuts", emoji: "🌰" },
  { id: "cash", label: "Cash crops", emoji: "💰" },
];

const CATEGORY_BY_ID: Record<string, CropCategory> = {
  maize: "grain", rice: "grain", wheat: "grain", barley: "grain", oats: "grain",
  millet: "grain", sorghum: "grain", "sorghum-sweet": "grain",
  beans: "legume", groundnut: "legume", soybean: "legume", cowpea: "legume",
  chickpea: "legume", lentil: "legume", green_pea: "legume", pigeon_pea: "legume",
  sesbania: "legume",
  cassava: "root", potato: "root", sweet_potato: "root", sweetpotato: "root",
  yam: "root", taro: "root", carrot: "root", cocoyam: "root",
  tomato: "vegetable", onion: "vegetable", cabbage: "vegetable",
  lettuce: "vegetable", spinach: "vegetable", okra: "vegetable", pepper: "vegetable",
  eggplant: "vegetable", cucumber: "vegetable", pumpkin: "vegetable",
  amaranth: "vegetable", kale: "vegetable", swiss_chard: "vegetable",
  cauliflower: "vegetable", broccoli: "vegetable", mushroom: "vegetable",
  watermelon: "fruit", banana: "fruit", pineapple: "fruit", mango: "fruit",
  avocado: "fruit", strawberry: "fruit", plantain: "fruit",
  basil: "herb", coriander: "herb", mint: "herb", chilli: "herb", garlic: "herb",
  ginger: "herb", turmeric: "herb", lemongrass: "herb", moringa: "herb", vanilla: "herb",
  cashew: "nut", macadamia: "nut",
  sugarcane: "cash", coffee: "cash", tea: "cash", cotton: "cash",
  sunflower: "cash", sesame: "cash", sunflower_seed: "cash", cocoa: "cash",
  napier: "cash",
};

export function cropCategory(crop: Crop): CropCategory {
  return CATEGORY_BY_ID[crop.id] ?? (FRUIT_IDS.has(crop.id) ? "fruit" : "vegetable");
}

const FRUIT_IDS = new Set(FRUIT_CROPS.map((c) => c.id));

function dedupe(list: Crop[]): Crop[] {
  const seen = new Set<string>();
  return list.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

export const CROPS: Crop[] = dedupe([
  ...BASE_CROPS,
  ...EXTRA_CROPS,
  ...FRUIT_CROPS,
  ...MORE_CROPS,
]).sort((a, b) => a.name.localeCompare(b.name));


export interface Ranked { crop: Crop; score: number; reasons: string[] }

export interface RecommendationInput {
  soil: SoilType;
  avgTempC: number;
  totalRain7d: number;
}


export function recommendCrops({ soil, avgTempC, totalRain7d }: RecommendationInput): Ranked[] {
  return CROPS.map((crop) => {
    let score = 0;
    const reasons: string[] = [];

    if (crop.soils.includes(soil)) { score += 40; reasons.push(`Grows well in ${soil} soil`); }
    else { score += 10; }

    if (avgTempC >= crop.tempMin && avgTempC <= crop.tempMax) {
      score += 35;
      reasons.push(`Temperature ${Math.round(avgTempC)}°C is ideal`);
    } else {
      const dist = Math.min(Math.abs(avgTempC - crop.tempMin), Math.abs(avgTempC - crop.tempMax));
      score += Math.max(0, 25 - dist * 3);
    }

    if (totalRain7d >= crop.rainMin && totalRain7d <= crop.rainMax) {
      score += 25;
      reasons.push(`Forecast rainfall suits this crop`);
    } else if (totalRain7d < crop.rainMin) {
      score += Math.max(0, 15 - (crop.rainMin - totalRain7d) / 3);
    } else {
      score += Math.max(0, 15 - (totalRain7d - crop.rainMax) / 8);
    }

    return { crop, score: Math.round(score), reasons };
  }).sort((a, b) => b.score - a.score);
}

export function getCrop(id: string) {
  return CROPS.find((c) => c.id === id);
}
