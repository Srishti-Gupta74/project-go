// Vercel Serverless Function for AI (Gemini)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPTS = {
  analyze: (imageB64) => ({
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: imageB64,
          }
        },
        {
          text: `You are an AI waste-management and circular-economy classification assistant.
Analyze this uploaded image carefully.

IMPORTANT RULES:
1. Do NOT assume that every visible object is waste. A reusable or normal functional object is NOT automatically waste.
2. First identify the primary object and its material composition.
3. Determine whether the object appears to be:
   - A normal item that is likely still in use / reusable
   - An unwanted but potentially reusable item
   - Actual waste
   - A large/bulky item requiring a different disposal route
   - A special-care item
   - Uncertain
4. Prioritize REUSE and DONATION when an item appears usable.
5. Large furniture and bulky objects (beds, mattresses, sofas, couches, wardrobes, large tables, large chairs, carpets, large appliances) must NEVER be classified as ordinary household-bin waste. For usable furniture, recommend REUSE / DONATE. If damaged or unwanted, recommend BULKY_WASTE collection.
6. The model must distinguish:
   - object / itemName: specific name of the object
   - material: main material(s)
   - isWaste: boolean (false if usable or still in service)
   - condition: "usable" | "damaged" | "unknown"
   - conditionConfidence: number between 0.0 and 1.0
   - category: "WET_WASTE" | "DRY_WASTE" | "SANITARY_WASTE" | "SPECIAL_CARE_WASTE" | "BULKY_WASTE" | "E_WASTE" | "TEXTILE" | "RECYCLABLE" | "COMPOSTABLE" | "REUSABLE" | "GENERAL_WASTE" | "UNKNOWN"
   - action: "REUSE" | "DONATE" | "RECYCLE" | "COMPOST" | "SPECIAL_DISPOSAL" | "BULKY_WASTE" | "GENERAL_DISPOSAL" | "UNKNOWN"
   - disposalRoute: clear route description (e.g. "Donate to charity or resell if usable; otherwise schedule bulky waste pickup")
   - bin: null (never recommend an unverified household bin for bulky furniture, e-waste, or batteries)
   - confidence: number between 0.0 and 1.0
   - reason: concise explanation of why this category and action were chosen
   - userConfirmationRequired: boolean (true if condition is ambiguous or confirmation needed)
   - disposal: practical disposal or reuse guidance in India
   - tip: practical eco-tip or circularity suggestion
   - recyclable: boolean
   - decompositionDays: number of days or null
   - impactStat: one shocking or inspiring statistic about this item/material in India

Respond ONLY with a valid JSON object matching these exact keys — no markdown, no backticks, no text outside JSON:
{
  "object": "name of object",
  "itemName": "name of object",
  "material": "materials",
  "isWaste": false,
  "condition": "usable",
  "conditionConfidence": 0.85,
  "category": "REUSABLE",
  "action": "REUSE",
  "disposalRoute": "Donate or resell",
  "bin": null,
  "confidence": 0.94,
  "reason": "This is a furniture item rather than household waste.",
  "userConfirmationRequired": false,
  "disposal": "Keep in circular use through donation.",
  "tip": "Clean and photograph for local community sharing.",
  "recyclable": true,
  "decompositionDays": null,
  "impactStat": "Extending furniture life prevents massive landfill volume."
}`
        }
      ]
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 900 }
  }),

  impact: (itemName, category) => ({
    contents: [{
      parts: [{
        text: `Calculate the environmental impact of recycling, reusing, or diverting "${itemName}" (${category}) instead of sending it to a landfill in India.\nRespond ONLY with a valid JSON object — no markdown, no backticks:\n{\n  "carbonPercent": number (% reduction in carbon footprint, 1-95),\n  "carbonSaved": "short phrase like 'saves ~30g CO₂' or 'saves ~25kg CO₂'",\n  "energySaved": "short phrase like 'powers a home for 1 day'",\n  "waterSaved": "short phrase or null",\n  "wildlifeFact": "one vivid emotional sentence about how diverting this helps animals or ecosystems in India",\n  "funFact": "one surprising and delightful fact about circular economy or recycling this material",\n  "treesEquivalent": "short phrase or null",\n  "recycledInto": "what this material becomes when reused or recycled"\n}`
      }]
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 600 }
  }),

  centers: (itemName, category, city) => {
    const searchHints = {
      wet: "compost facility, bio-waste plant, or municipal organic waste collection center",
      dry: "scrap dealer, kabadiwala, dry waste collection center, or recycling facility",
      hazardous: "hazardous waste disposal center, battery recycling center, or municipal depot",
      ewaste: "e-waste collection center, authorized electronic scrap dealer, or recycling drop-off",
      sanitary: "municipal solid waste facility or sanitary waste processing depot",
      WET_WASTE: "compost facility, bio-waste plant, or municipal organic waste collection center",
      DRY_WASTE: "scrap dealer, kabadiwala, dry waste collection center, or recycling facility",
      RECYCLABLE: "scrap dealer, kabadiwala, or dry waste recycling facility",
      COMPOSTABLE: "compost facility, organic waste collection, or municipal bio-bin",
      REUSABLE: "NGO donation center, second-hand market, thrift drop-off, or reuse charity (like Goonj)",
      BULKY_WASTE: "municipal bulky waste collection center, furniture dismantler, or scrap depot",
      E_WASTE: "authorized e-waste collection center, electronic recycler, or take-back point",
      SPECIAL_CARE_WASTE: "hazardous waste facility, battery recycling kiosk, or pharmacy disposal",
      TEXTILE: "cloth donation NGO (like Goonj), charity drive, or textile recycling center",
      SANITARY_WASTE: "municipal solid waste incineration depot or disposal point",
      GENERAL_WASTE: "municipal solid waste collection center",
      UNKNOWN: "local municipal waste management depot or recycling center",
    };

    return {
      contents: [{
        parts: [{
          text: `You are an expert Indian waste management and local recycling locator assistant.
Find the top 3 nearest authentic recycling centers, scrap dealers (kabadiwalas), or waste disposal facilities for "${itemName}" (${category} waste) serving "${city}", India.

CRITICAL INSTRUCTIONS:
1. ALWAYS return exactly 3 top facilities or dealers. Never return an empty array or fewer than 3 items.
2. Search in and around "${city}". If "${city}" is a specific neighborhood, colony, suburb, or small locality, automatically expand outward to the nearest major city, municipal corporation, or district hub (e.g. if "${city}" is in or near Jaipur, find the top 3 authentic centers in Jaipur and surrounding district) so the user always receives the nearest available options.
3. Every center must be appropriate for ${category} waste (${searchHints[category] || "recycling center"}).
4. Provide realistic, helpful details for each entry:
   - "name": Official or authentic name of the scrap dealer, kabadiwala, recycling center, or municipal facility.
   - "type": e.g. "Scrap Dealer / Kabadiwala", "Recycling Center", "Municipal Collection Point", "E-Waste Depot".
   - "address": Locality/area and city in India (e.g. "Mansarovar, Jaipur, Rajasthan").
   - "distance": Realistic approximate distance from "${city}" (e.g. "~1.5 km", "~3.2 km", "~5.0 km").
   - "phone": Valid phone number format or null if not publicly available.
   - "hours": Operating hours (e.g. "9:00 AM - 7:00 PM") or null.
   - "tip": Helpful tip for visiting or selling scrap (e.g. "Accepts bulk scrap and clean recyclables").
   - "mapsQuery": Exact search term for Google Maps (e.g. "[Business Name] [Area] [City]").

Respond ONLY with a valid JSON array of 3 objects — no markdown formatting, no backticks, no explanations:
[
  {
    "name": "...",
    "type": "...",
    "address": "...",
    "distance": "...",
    "phone": "...",
    "hours": "...",
    "tip": "...",
    "mapsQuery": "..."
  }
]`
        }]
      }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 800 }
    };
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Add GEMINI_API_KEY to Vercel environment variables.' });
  }

  let body = req.body;
  try {
    if (typeof body === 'string') body = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { type, imageB64, itemName, category, city } = body || {};

  let geminiBody;
  try {
    if (type === 'analyze') {
      if (!imageB64) throw new Error('Missing imageB64');
      geminiBody = PROMPTS.analyze(imageB64);
    } else if (type === 'impact') {
      if (!itemName || !category) throw new Error('Missing itemName or category');
      geminiBody = PROMPTS.impact(itemName, category);
    } else if (type === 'centers') {
      if (!category) throw new Error('Missing category');
      geminiBody = PROMPTS.centers(itemName || 'waste item', category, city || 'India');
    } else {
      throw new Error(`Unknown type: ${type}`);
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    geminiBody.generationConfig = geminiBody.generationConfig || {};
    geminiBody.generationConfig.thinkingConfig = { thinkingBudget: 0 };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini error:', errText);
      return res.status(geminiRes.status).json({ error: 'Gemini API error', detail: errText });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts || [];
    const rawText = parts.filter(p => p.text).map(p => p.text).pop() || '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
