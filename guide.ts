import type { Crop, SoilType } from "./crops";
import { cropCategory } from "./crops";

export interface GuideStage {
  key: string;
  title: string;
  icon: "calendar" | "shovel" | "seed" | "plant" | "leaf" | "droplet" | "bug" | "basket" | "box";
  intro: string;
  items: string[];
}

const SOIL_TIPS: Record<SoilType, string> = {
  loam: "Loam soil is already good. Just add compost each season to keep it strong.",
  clay: "Clay holds water. Make raised beds or ridges so the roots do not drown.",
  sandy: "Sandy soil dries fast. Mix in plenty of manure or compost to hold water.",
  silty: "Silty soil packs down easily. Do not walk on the beds after you make them.",
  peaty: "Peaty soil is acidic. Add a little wood ash or lime before planting.",
  chalky: "Chalky soil is thin and alkaline. Add manure and mulch heavily.",
};

/**
 * Builds a long, plain-language, step-by-step planting guide for any crop in
 * the library. Everything is generated from the crop's own data, so new crops
 * automatically get a full guide with no extra writing.
 */
export function buildGuide(crop: Crop): GuideStage[] {
  const cat = cropCategory(crop);
  const soils = crop.soils.join(", ");
  const perennial = cat === "fruit" && /year|month/i.test(crop.daysToHarvest);

  const stages: GuideStage[] = [
    {
      key: "when",
      title: "1. Choose the right time",
      icon: "calendar",
      intro: `${crop.name} is a ${crop.season.toLowerCase()} crop.`,
      items: [
        `Plant when the average temperature stays between ${crop.tempMin}°C and ${crop.tempMax}°C.`,
        `This crop needs about ${crop.rainMin}–${crop.rainMax} mm of rain over a week. Check the forecast before you plant.`,
        "If heavy storms or a long dry spell are coming, wait a few days.",
        `From planting to first harvest takes about ${crop.daysToHarvest}. Count backwards so harvest does not fall in the worst weather.`,
      ],
    },
    {
      key: "land",
      title: "2. Prepare the land",
      icon: "shovel",
      intro: `Best soils: ${soils}.`,
      items: [
        "Clear all weeds, old roots and rubbish from the plot.",
        "Dig or plough the soil about 20–30 cm deep so it is loose and crumbly.",
        "Break big lumps and level the surface with a rake or hoe.",
        `Spread 2–3 wheelbarrows of well-rotted manure or compost for every 10 steps by 10 steps of land.`,
        ...crop.soils.map((s) => SOIL_TIPS[s]).slice(0, 2),
        "Make a small drainage channel around the plot so rain water can run off.",
      ],
    },
    {
      key: "seed",
      title: "3. Get good planting material",
      icon: "seed",
      intro: "Good seed is half the harvest.",
      items: [
        "Buy certified seed or take material only from strong, healthy, disease-free plants.",
        "Throw away seed that is cracked, mouldy, discoloured or eaten by insects.",
        "Test seed first: put 10 seeds in a wet cloth for 3 days. If fewer than 7 sprout, find better seed.",
        perennial
          ? "For fruit trees, buy grafted seedlings from a trusted nursery — they fruit years earlier than seed."
          : "Treat seed with an approved seed dressing if pests are common in your area.",
      ],
    },
    {
      key: "plant",
      title: "4. Plant the crop",
      icon: "plant",
      intro: "Follow these steps in order.",
      items: [...crop.steps, "Water gently right after planting so the soil settles around the seed."],
    },
    {
      key: "feed",
      title: "5. Feed the plants",
      icon: "leaf",
      intro: "Hungry plants give small harvests.",
      items:
        cat === "legume"
          ? [
              "Legumes make their own nitrogen. Do not add much nitrogen fertiliser.",
              "A little phosphorus at planting (like DAP or bone meal) helps roots and pods.",
              "Add wood ash or compost if the leaves look pale.",
            ]
          : [
              "Add a basal fertiliser or compost in the planting hole, then cover with a little soil before the seed touches it.",
              "Top-dress with nitrogen (urea, CAN or manure tea) 3–5 weeks after the plants come up.",
              "Do not put fertiliser directly on the stem — keep it a hand's width away.",
              "Yellow lower leaves usually mean the plant needs nitrogen.",
            ],
    },
    {
      key: "water",
      title: "6. Water the crop",
      icon: "droplet",
      intro: crop.water,
      items: [
        "Water early in the morning or late in the afternoon, never in the hot midday sun.",
        "Water the soil at the base, not the leaves — wet leaves invite disease.",
        "Push a finger into the soil. If it is dry two joints deep, it is time to water.",
        "Spread dry grass, straw or leaves as mulch to keep the soil moist and cool.",
      ],
    },
    {
      key: "protect",
      title: "7. Weeds, pests and disease",
      icon: "bug",
      intro: `Watch out for: ${crop.pests.join(", ")}.`,
      items: [
        "Weed by hand or hoe at 2 weeks and again at 5 weeks. Weeds steal food and water.",
        "Walk through the field twice a week and look under the leaves.",
        "Pick off caterpillars and badly attacked leaves by hand and burn or bury them.",
        "Try soap-and-water spray, neem or wood-ash first before buying chemicals.",
        "If you must spray, use the exact dose on the label, wear a mask, and never spray close to harvest.",
        "Do not plant the same crop in the same spot two seasons in a row — rotate.",
      ],
    },
    {
      key: "harvest",
      title: "8. Harvest",
      icon: "basket",
      intro: crop.harvest,
      items: [
        `Expect roughly ${crop.yield} if the crop is well cared for.`,
        "Harvest in the cool of the morning so the produce stays fresh longer.",
        "Handle gently — bruised produce rots quickly and sells for less.",
        "Harvest in stages if the crop does not ripen all at once.",
      ],
    },
    {
      key: "after",
      title: "9. After harvest and storage",
      icon: "box",
      intro: "A good harvest can still be lost in storage.",
      items: [
        "Dry grains and pulses well in the sun until they are hard before you store them.",
        "Store in clean, dry bags or sealed drums, raised off the floor and away from walls.",
        "Keep fresh vegetables and fruit in shade with air moving around them.",
        "Check the store every two weeks for damp, mould, rats and insects.",
        "Keep back your best material as seed for the next season, stored separately and labelled.",
      ],
    },
  ];

  return stages;
}
