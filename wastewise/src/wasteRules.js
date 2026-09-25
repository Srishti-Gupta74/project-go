/**
 * wasteRules.js
 * 
 * Deterministic Waste & Circular-Economy Validation Engine.
 * 
 * Architecture Principle:
 *   Gemini Classification (probabilistic)
 *           +
 *   Application Validation Rules (deterministic)
 *           +
 *   Local Waste-Stream Configuration (contextual)
 *           =
 *   Final User Recommendation
 * 
 * Never assumes every object is waste.
 * Prioritizes: REDUCE → REUSE → DONATE → RECYCLE → SPECIAL DISPOSAL → GENERAL DISPOSAL.
 */

// ─── 1. Configurable Waste Stream & Action Definitions ──────────────────────────

export const WASTE_STREAMS = {
  REUSABLE: {
    id: "REUSABLE",
    label: "Reusable / Donate",
    shortLabel: "Reusable",
    color: "#38bdf8",
    darkColor: "#0284c7",
    bg: "#082f49",
    emoji: "🔄",
    actionLabel: "Reuse or Donate",
    action: "REUSE",
    defaultBin: null,
    points: 25,
    description: "Item appears usable. Prioritize reuse, donation, or resale before disposal.",
  },
  BULKY_WASTE: {
    id: "BULKY_WASTE",
    label: "Bulky Waste",
    shortLabel: "Bulky Item",
    color: "#fb923c",
    darkColor: "#ea580c",
    bg: "#2d1200",
    emoji: "🛋️",
    actionLabel: "Bulky Waste Collection",
    action: "BULKY_WASTE",
    defaultBin: null,
    points: 20,
    description: "Oversized furniture or appliances requiring dedicated municipal pickup or dismantling.",
  },
  RECYCLABLE: {
    id: "RECYCLABLE",
    label: "Recyclable / Dry Waste",
    shortLabel: "Recyclable",
    color: "#60a5fa",
    darkColor: "#2563eb",
    bg: "#0c1a2e",
    emoji: "♻️",
    actionLabel: "Recycle",
    action: "RECYCLE",
    defaultBin: null,
    points: 15,
    description: "Clean recyclable packaging (plastic, metal, cardboard, glass) for recyclers or kabadiwalas.",
  },
  DRY_WASTE: {
    id: "DRY_WASTE",
    label: "Dry Waste",
    shortLabel: "Dry Waste",
    color: "#60a5fa",
    darkColor: "#2563eb",
    bg: "#0c1a2e",
    emoji: "🔵",
    actionLabel: "Recycle / Dry Waste",
    action: "RECYCLE",
    defaultBin: null,
    points: 15,
    description: "Non-biodegradable dry waste suitable for segregation and recovery.",
  },
  COMPOSTABLE: {
    id: "COMPOSTABLE",
    label: "Compostable / Organic",
    shortLabel: "Compostable",
    color: "#4ade80",
    darkColor: "#16a34a",
    bg: "#052e16",
    emoji: "🌱",
    actionLabel: "Compost / Organic Waste",
    action: "COMPOST",
    defaultBin: null,
    points: 15,
    description: "Biodegradable organic matter suitable for home composting or municipal wet waste processing.",
  },
  WET_WASTE: {
    id: "WET_WASTE",
    label: "Wet Waste",
    shortLabel: "Wet Waste",
    color: "#4ade80",
    darkColor: "#16a34a",
    bg: "#052e16",
    emoji: "🟢",
    actionLabel: "Compost / Wet Waste",
    action: "COMPOST",
    defaultBin: null,
    points: 10,
    description: "Kitchen scraps and organic discards for municipal composting.",
  },
  E_WASTE: {
    id: "E_WASTE",
    label: "Electronic Waste",
    shortLabel: "E-Waste",
    color: "#c084fc",
    darkColor: "#7c3aed",
    bg: "#1a0a2e",
    emoji: "💻",
    actionLabel: "E-Waste Collection",
    action: "SPECIAL_DISPOSAL",
    defaultBin: null,
    points: 30,
    description: "Electronics containing circuit boards, battery cells, or recoverable precious metals.",
  },
  SPECIAL_CARE_WASTE: {
    id: "SPECIAL_CARE_WASTE",
    label: "Special Care / Hazardous",
    shortLabel: "Special Care",
    color: "#f87171",
    darkColor: "#dc2626",
    bg: "#2d0a0a",
    emoji: "⚠️",
    actionLabel: "Special Disposal",
    action: "SPECIAL_DISPOSAL",
    defaultBin: null,
    points: 25,
    description: "Hazardous or toxic materials (batteries, paints, chemicals) requiring designated collection.",
  },
  TEXTILE: {
    id: "TEXTILE",
    label: "Textile / Fabric",
    shortLabel: "Textile",
    color: "#a78bfa",
    darkColor: "#7c3aed",
    bg: "#1e1138",
    emoji: "👕",
    actionLabel: "Donate or Textile Recycling",
    action: "REUSE",
    defaultBin: null,
    points: 15,
    description: "Wearable garments, fabric, or linens. Prioritize donation; downcycle if damaged.",
  },
  SANITARY_WASTE: {
    id: "SANITARY_WASTE",
    label: "Sanitary Waste",
    shortLabel: "Sanitary",
    color: "#fb7185",
    darkColor: "#e11d48",
    bg: "#2e0814",
    emoji: "🧤",
    actionLabel: "Sanitary Disposal",
    action: "GENERAL_DISPOSAL",
    defaultBin: null,
    points: 10,
    description: "Hygienic waste items. Must be wrapped securely in paper before disposal.",
  },
  GENERAL_WASTE: {
    id: "GENERAL_WASTE",
    label: "General Waste",
    shortLabel: "General Waste",
    color: "#94a3b8",
    darkColor: "#475569",
    bg: "#1e293b",
    emoji: "🗑️",
    actionLabel: "General Disposal",
    action: "GENERAL_DISPOSAL",
    defaultBin: null,
    points: 5,
    description: "Non-recyclable non-hazardous residual waste for municipal collection.",
  },
  UNKNOWN: {
    id: "UNKNOWN",
    label: "Needs Information",
    shortLabel: "Unknown",
    color: "#facc15",
    darkColor: "#ca8a04",
    bg: "#2a2206",
    emoji: "❓",
    actionLabel: "Check Guidelines",
    action: "UNKNOWN",
    defaultBin: null,
    points: 5,
    description: "Visual identity or disposal route is uncertain. Check local municipality guidelines.",
  },
};

// ─── 2. Normalization & Group Matchers ──────────────────────────────────────────

const BULKY_OBJECTS = [
  "bed", "bunk bed", "single bed", "double bed", "cot", "bed frame", "headboard",
  "mattress", "futon", "box spring",
  "sofa", "couch", "settee", "divan", "loveseat", "recliners", "recliner",
  "wardrobe", "almirah", "armoire", "cupboard", "closet", "cabinet",
  "table", "dining table", "study table", "coffee table", "work desk", "desk", "desk table",
  "chair", "armchair", "office chair", "dining chair", "rocking chair",
  "bookshelf", "bookcase", "dresser", "nightstand",
  "carpet", "large rug", "rug",
  "refrigerator", "fridge", "washing machine", "dishwasher", "air conditioner",
  "furniture", "wooden furniture"
];

const BATTERY_SPECIAL_OBJECTS = [
  "battery", "batteries", "lithium battery", "button cell", "car battery",
  "aa battery", "aaa battery", "power bank", "accumulator", "dry cell"
];

const SPECIAL_CARE_MEDICINE = [
  "medicine", "medicines", "pill", "pills", "tablet strip", "capsule",
  "expired medicine", "syringe", "needle", "thermometer", "mercury",
  "paint", "spray paint", "solvent", "thinner", "varnish", "chemical", "pesticide",
  "insecticide", "fertilizer", "tube light", "cfl", "fluorescent bulb"
];

const E_WASTE_OBJECTS = [
  "smartphone", "mobile phone", "cell phone", "phone", "iphone", "android phone",
  "laptop", "computer", "macbook", "pc", "desktop computer", "monitor", "display screen",
  "tablet", "ipad", "printer", "scanner", "router", "modem", "motherboard",
  "circuit board", "hard drive", "ssd", "ram", "power adapter", "charger",
  "headphones", "earbuds", "electronic gadget", "smartwatch", "remote control",
  "calculator", "electronic toy"
];

const TEXTILE_OBJECTS = [
  "clothes", "clothing", "shirt", "t-shirt", "jeans", "pants", "trousers", "jacket",
  "sweater", "hoodie", "coat", "dress", "skirt", "sari", "kurta", "dupatta",
  "curtain", "drapes", "bedsheet", "bed sheet", "blanket", "quilt", "pillow",
  "towel", "shoes", "sneakers", "boots", "sandals", "fabric", "textile"
];

const SANITARY_OBJECTS = [
  "diaper", "nappy", "sanitary pad", "sanitary napkin", "tampon", "cotton swab",
  "q-tip", "bandage", "band-aid", "gauze", "medical mask", "face mask",
  "gloves", "latex gloves", "wet wipe", "baby wipe", "tissue paper (soiled)"
];

const COMPOSTABLE_FOOD = [
  "banana peel", "apple core", "fruit peel", "citrus peel", "orange peel",
  "vegetable scrap", "vegetable peel", "potato peel", "food scrap", "food scraps",
  "leftover food", "bread", "rice", "tea bag", "tea leaves", "coffee grounds",
  "egg shell", "egg shells", "nutshells", "dry leaves", "fallen leaves",
  "garden waste", "flower", "flowers", "compostable"
];

const RECYCLABLE_CONTAINERS = [
  "plastic bottle", "water bottle", "beverage bottle", "soda bottle",
  "can", "tin can", "soda can", "beer can", "aluminium can", "aluminum can",
  "cardboard", "cardboard box", "carton", "corrugated box", "shipping box",
  "newspaper", "magazine", "paper", "envelope", "notebook",
  "glass bottle", "glass jar", "jam jar", "pickle jar", "glass container"
];

// Helper to check regex word boundaries or substring match
function matchesPattern(text, patterns) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return patterns.some(p => {
    const pLower = p.toLowerCase();
    if (lower === pLower) return true;
    // Word boundary check
    const regex = new RegExp(`(^|\\b|\\s|_|-)${pLower}(\\b|\\s|_|-|s|es|$)`, "i");
    return regex.test(lower);
  });
}

// ─── 3. Deterministic Validation / Rule Engine ─────────────────────────────────

/**
 * Validates, corrects, and enriches Gemini raw classification output.
 * 
 * @param {Object} rawResult - Raw parsed JSON response from Gemini
 * @param {string|null} userConditionOverride - Optional user interactive override: "usable" | "damaged" | "unknown"
 * @returns {Object} Validated and safe waste classification result
 */
export function validateWasteClassification(rawResult, userConditionOverride = null) {
  // Graceful fallback for empty or malformed input
  if (!rawResult || typeof rawResult !== "object") {
    return {
      object: "Unknown Object",
      itemName: "Unknown Object",
      material: "Unspecified",
      isWaste: true,
      condition: "unknown",
      conditionConfidence: 0.2,
      category: "UNKNOWN",
      action: "UNKNOWN",
      disposalRoute: "Check local municipality guidelines or rescan with clearer lighting.",
      bin: null,
      confidence: 0.3,
      reason: "Could not read classification from vision model.",
      userConfirmationRequired: true,
      disposal: "Check local guidelines before discarding.",
      tip: "Take a clear, well-lit photo of the item on a plain background.",
      impactStat: "Over 62 million tonnes of waste are generated annually in India; proper identification is the first step.",
      stream: WASTE_STREAMS.UNKNOWN,
    };
  }

  // 1. Identify primary object name
  const objectName = (rawResult.object || rawResult.itemName || "Item").trim();
  const material = (rawResult.material || "Mixed").trim();
  const norm = objectName.toLowerCase();

  // 2. Condition handling
  let condition = userConditionOverride || rawResult.condition || "unknown";
  if (!["usable", "damaged", "unknown"].includes(condition)) {
    condition = "unknown";
  }

  // Condition confidence (0 to 1)
  let conditionConfidence = typeof rawResult.conditionConfidence === "number"
    ? Math.min(1, Math.max(0, rawResult.conditionConfidence > 1 ? rawResult.conditionConfidence / 100 : rawResult.conditionConfidence))
    : (condition === "unknown" ? 0.4 : 0.8);

  // Overall confidence (0 to 1)
  let confidence = typeof rawResult.confidence === "number"
    ? Math.min(1, Math.max(0, rawResult.confidence > 1 ? rawResult.confidence / 100 : rawResult.confidence))
    : 0.75;

  let isWaste = Boolean(rawResult.isWaste ?? true);
  let category = (rawResult.category || "UNKNOWN").toUpperCase();
  let action = (rawResult.action || "UNKNOWN").toUpperCase();
  let disposalRoute = (rawResult.disposalRoute || "").trim();
  let bin = null; // Always default to null — no unverified universal bins!
  let reason = (rawResult.reason || "").trim();
  let userConfirmationRequired = Boolean(rawResult.userConfirmationRequired);

  // ── RULE 1: BULKY FURNITURE & APPLIANCES (Bed, Mattress, Sofa, Wardrobe, Tables, Chairs) ──
  if (matchesPattern(norm, BULKY_OBJECTS)) {
    bin = null; // NEVER allow a household bin for bulky furniture!

    if (condition === "usable") {
      isWaste = false;
      category = "REUSABLE";
      action = "REUSE";
      disposalRoute = "Donate to local charities/shelters, resell on second-hand marketplaces, or give away to neighbors.";
      reason = `This ${objectName} appears to be functional furniture rather than waste. Reusing or donating keeps large items out of landfills.`;
    } else if (condition === "damaged") {
      isWaste = true;
      category = "BULKY_WASTE";
      action = "BULKY_WASTE";
      disposalRoute = "Schedule a municipal bulky-waste pickup or arrange pickup with a local furniture dismantler/scrap dealer.";
      reason = `This ${objectName} is a large/bulky item. Oversized furniture cannot go into household bins and must be collected via bulky waste services.`;
    } else {
      // Condition unknown
      isWaste = false;
      category = "BULKY_WASTE";
      action = "BULKY_WASTE";
      userConfirmationRequired = true;
      disposalRoute = "If still usable, donate or sell. If broken or worn out, schedule municipal bulky waste collection.";
      reason = `This ${objectName} is a bulky item. Its condition is uncertain from the photo—verify if it can be reused before discarding.`;
    }
  }

  // ── RULE 2: BATTERIES & ACCUMULATORS ──
  else if (matchesPattern(norm, BATTERY_SPECIAL_OBJECTS)) {
    bin = null;
    isWaste = true;
    category = "SPECIAL_CARE_WASTE";
    action = "SPECIAL_DISPOSAL";
    userConfirmationRequired = false;
    disposalRoute = "Drop off at a designated battery recycling collection kiosk or hazardous waste drop point.";
    reason = "Batteries contain reactive chemicals and heavy metals. They cause landfill fires and must never be placed in household bins.";
  }

  // ── RULE 3: MEDICINES, CHEMICALS, HAZARDOUS ──
  else if (matchesPattern(norm, SPECIAL_CARE_MEDICINE)) {
    bin = null;
    isWaste = true;
    category = "SPECIAL_CARE_WASTE";
    action = "SPECIAL_DISPOSAL";
    userConfirmationRequired = false;
    disposalRoute = "Return expired medicines to pharmacy take-back boxes; take chemicals to municipal hazardous waste depots.";
    reason = "Pharmaceuticals, paints, and chemicals can contaminate drinking water supplies and require controlled disposal.";
  }

  // ── RULE 4: E-WASTE & ELECTRONICS (Smartphones, Laptops, Gadgets) ──
  else if (matchesPattern(norm, E_WASTE_OBJECTS)) {
    bin = null;

    if (condition === "usable") {
      isWaste = false;
      category = "REUSABLE";
      action = "DONATE";
      userConfirmationRequired = true;
      disposalRoute = "Donate to educational initiatives, resell, or trade in through authorized brand programs.";
      reason = `Working electronics have high circular value. Consider extending the lifespan of this ${objectName} before disposal.`;
    } else {
      isWaste = true;
      category = "E_WASTE";
      action = "SPECIAL_DISPOSAL";
      disposalRoute = "Deposit at an authorized e-waste collection center or certified electronic dismantler.";
      reason = "Electronic waste contains valuable metals and hazardous solder that require specialized recycling facilities.";
    }
  }

  // ── RULE 5: TEXTILES & CLOTHING ──
  else if (matchesPattern(norm, TEXTILE_OBJECTS)) {
    bin = null;

    if (condition === "usable") {
      isWaste = false;
      category = "REUSABLE";
      action = "DONATE";
      disposalRoute = "Donate to cloth donation drives, shelters, or NGOs such as Goonj.";
      reason = "Wearable clothing should be kept in circulation through donation to reduce textile landfill burdens.";
    } else if (condition === "damaged") {
      isWaste = true;
      category = "TEXTILE";
      action = "RECYCLE";
      disposalRoute = "Repurpose as cleaning rags, drop in textile recycling bins, or sell to scrap dealers.";
      reason = "Worn out textiles can be mechanically shredded and downcycled into industrial insulation or mops.";
    } else {
      isWaste = false;
      category = "TEXTILE";
      action = "REUSE";
      userConfirmationRequired = true;
      disposalRoute = "Donate if still wearable; repurpose as household rags or recycle if torn.";
      reason = "Textiles should be evaluated for reusability before considering disposal.";
    }
  }

  // ── RULE 6: SANITARY WASTE ──
  else if (matchesPattern(norm, SANITARY_OBJECTS)) {
    bin = null;
    isWaste = true;
    category = "SANITARY_WASTE";
    action = "GENERAL_DISPOSAL";
    userConfirmationRequired = false;
    disposalRoute = "Wrap securely in newspaper or waste pouch and hand over to municipal sanitary waste collectors.";
    reason = "Sanitary waste poses biological risks. It must be cleanly wrapped and sent for high-temperature incineration.";
  }

  // ── RULE 7: COMPOSTABLE FOOD & GARDEN WASTE ──
  else if (matchesPattern(norm, COMPOSTABLE_FOOD)) {
    bin = null;
    isWaste = true;
    category = "COMPOSTABLE";
    action = "COMPOST";
    userConfirmationRequired = false;
    disposalRoute = "Place in home composting bin or municipal organic/wet waste collection.";
    reason = "Organic food waste breaks down naturally into nutrient-rich compost and prevents landfill methane emissions.";
  }

  // ── RULE 8: RECYCLABLE PACKAGING & CONTAINERS (Bottles, Cans, Boxes) ──
  else if (matchesPattern(norm, RECYCLABLE_CONTAINERS)) {
    bin = null;
    isWaste = true;
    category = "RECYCLABLE";
    action = "RECYCLE";
    userConfirmationRequired = false;
    disposalRoute = "Empty, rinse clean, flatten, and hand over to your local kabadiwala or dry waste collector.";
    reason = "Clean packaging materials (PET bottles, aluminium cans, cardboard) are readily recyclable into new products.";
  }

  // ── RULE 9: CONFIDENCE & UNCERTAINTY FILTER ──
  else if (confidence < 0.45 || category === "UNKNOWN") {
    bin = null;
    category = "UNKNOWN";
    action = "UNKNOWN";
    userConfirmationRequired = true;
    if (!reason) {
      reason = "Visual confidence is low. Could not determine exact material or disposal route with certainty.";
    }
    disposalRoute = "Check local municipality waste segregation guidelines or scan the item from a different angle.";
  }

  // ── RULE 10: LEGACY CATEGORY MAPPING & SANITIZATION ──
  else {
    // Map legacy categories if Gemini returned old strings
    const legacyMap = {
      wet: "WET_WASTE",
      dry: "DRY_WASTE",
      hazardous: "SPECIAL_CARE_WASTE",
      ewaste: "E_WASTE",
      sanitary: "SANITARY_WASTE",
    };
    if (legacyMap[rawResult.category]) {
      category = legacyMap[rawResult.category];
    }
    // Never allow a household bin unless verified
    bin = null;
  }

  // Resolve matching stream config (or fallback to UNKNOWN)
  const stream = WASTE_STREAMS[category] || WASTE_STREAMS.UNKNOWN;

  // Preserve or generate helpful disposal instructions
  const disposalText = (rawResult.disposal && rawResult.disposal.length > 10)
    ? rawResult.disposal
    : disposalRoute;

  const tipText = (rawResult.tip && rawResult.tip.length > 5)
    ? rawResult.tip
    : (category === "REUSABLE" ? "Extending an item's life by 9 months reduces its carbon footprint by ~30%." : "Clean and segregate waste at source to ensure maximum recycling efficiency.");

  const impactStatText = rawResult.impactStat || "Segregating waste at source diverts up to 80% of waste away from open dumps.";

  return {
    object: objectName,
    itemName: objectName, // Backwards-compatible
    material: material,
    isWaste: isWaste,
    condition: condition,
    conditionConfidence: conditionConfidence,
    category: category,
    action: action || stream.action,
    disposalRoute: disposalRoute || disposalText,
    bin: bin,
    confidence: confidence,
    reason: reason || stream.description,
    userConfirmationRequired: userConfirmationRequired,
    disposal: disposalText,
    tip: tipText,
    recyclable: Boolean(rawResult.recyclable ?? (category === "RECYCLABLE" || category === "DRY_WASTE")),
    decompositionDays: rawResult.decompositionDays ?? null,
    impactStat: impactStatText,
    stream: stream,
  };
}
