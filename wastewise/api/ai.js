// Vercel API route ported from netlify/functions/ai.js
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
      wet: "compost facility or organic waste collection",
      dry: "scrap dealer or kabadiwala or recycling center",
      hazardous: "hazardous waste disposal facility",
      ewaste: "e-waste collection or electronics recycling center",
      sanitary: "municipal solid waste collection point",
    };
    return {
      contents: [{
        parts: [{
          text: `Find 3 real or realistic recycling/disposal centers for "${itemName}" (${category} waste) in ${city}, India.\nLook for: ${searchHints[category] || "recycling center"}.\nRespond ONLY with a valid JSON array — no markdown, no backticks:\n[\n  {\n    "name": "center name",\n    "type": "type of facility",\n    "address": "full address in ${city}",\n    "distance": "approximate distance like ~2 km",\n    "phone": "phone number or null",\n    "hours": "opening hours or null",\n    "tip": "one helpful tip for visiting",\n    "mapsQuery": "search query for Google Maps"\n  }\n]\nIf you don't know real centers in ${city}, generate 3 realistic fictional ones that sound plausible for that city.`
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
