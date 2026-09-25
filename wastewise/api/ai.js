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
          text: `You are WasteWise, an expert on India's waste management system.\nAnalyze this image carefully and identify what waste item is shown.\nRespond ONLY with a valid JSON object — no markdown, no backticks, no explanation:\n{\n  "itemName": "specific common name of the item",\n  "category": "wet" or "dry" or "hazardous" or "ewaste" or "sanitary",\n  "confidence": number from 0 to 100,\n  "disposal": "one clear sentence on how to dispose in India",\n  "tip": "one practical eco-tip for this item",\n  "recyclable": true or false,\n  "decompositionDays": number or null,\n  "impactStat": "one shocking statistic about this type of waste in India"\n}\nCategories: wet=food/organic, dry=paper/plastic/glass/metal, hazardous=chemicals/batteries/paint, ewaste=electronics, sanitary=diapers/pads`
        }
      ]
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 800 }
  }),

  impact: (itemName, category) => ({
    contents: [{
      parts: [{
        text: `Calculate the environmental impact of recycling "${itemName}" (${category} waste) instead of sending it to landfill.\nRespond ONLY with a valid JSON object — no markdown, no backticks:\n{\n  "carbonPercent": number (% reduction in carbon footprint, 1-95),\n  "carbonSaved": "short phrase like 'saves ~30g CO₂'",\n  "energySaved": "short phrase like 'powers a bulb for 3 hours'",\n  "waterSaved": "short phrase or null",\n  "wildlifeFact": "one vivid emotional sentence about how this helps a specific animal or ecosystem in India",\n  "funFact": "one surprising and delightful fact about recycling this material",\n  "treesEquivalent": "short phrase or null",\n  "recycledInto": "what this material commonly becomes after recycling"\n}`
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
