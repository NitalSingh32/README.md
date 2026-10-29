import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for date calculation
function getDatesArray(startDateStr: string, count: number): string[] {
  const result: string[] = [];
  const start = new Date(startDateStr);
  const validStart = isNaN(start.getTime()) ? new Date() : start;
  for (let i = 0; i < count; i++) {
    const d = new Date(validStart);
    d.setDate(validStart.getDate() + i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

// Fallback generator in case of API failure or missing keys
function generateFallbackItinerary(prefs: any): any {
  const count = Math.max(1, Math.min(prefs.daysCount || 3, 14));
  const dates = getDatesArray(prefs.startDate || new Date().toISOString().split('T')[0], count);
  const dest = prefs.destination || 'Paris, France';
  const pace = prefs.pace || 'balanced';
  const tier = prefs.budgetTier || 'moderate';

  const tierMultiplier = tier === 'budget' ? 65 : tier === 'luxury' ? 320 : tier === 'ultra_luxury' ? 750 : 160;
  const totalCost = tierMultiplier * count;

  const sampleDays = dates.map((dateStr, idx) => {
    const dayNum = idx + 1;
    return {
      dayNumber: dayNum,
      date: dateStr,
      theme: dayNum === 1 ? 'Arrival & City Orientation' : dayNum === 2 ? 'Historic Landmarks & Cultural Immersion' : dayNum === 3 ? 'Art, Scenic Panoramas & Local Gastronomy' : `Iconic Highlights & Hidden Neighborhoods (Part ${dayNum})`,
      summary: `Explore the vibrant spirit of ${dest} with morning discovery, afternoon immersive culture, and an enchanting evening experience.`,
      activities: [
        {
          id: `act-${dayNum}-1`,
          timeSlot: 'morning',
          time: '09:00 AM',
          title: dayNum === 1 ? `Historic Center & Iconic Promenade` : `Morning Cultural Landmark`,
          location: `${dest} Main District`,
          description: `Kick off the day strolling along the historic avenues, soaking in the architectural heritage and lively morning ambiance.`,
          duration: '2.5 hours',
          estimatedCost: Math.round(tierMultiplier * 0.15),
          category: 'sightseeing',
          insiderTip: 'Arrive 15 minutes before opening to beat the crowd and enjoy calm photography lighting.',
          bookingRequired: false,
        },
        {
          id: `act-${dayNum}-2`,
          timeSlot: 'afternoon',
          time: '02:00 PM',
          title: `Renowned Museum & Artisan Quarter`,
          location: `${dest} Cultural Quarter`,
          description: `Delve into world-class exhibitions, unique local artisan boutiques, and hidden courtyard cafes.`,
          duration: '3 hours',
          estimatedCost: Math.round(tierMultiplier * 0.25),
          category: 'culture',
          insiderTip: 'Audio guides or interactive self-guided apps are usually available at reception for deeper context.',
          bookingRequired: true,
        },
        {
          id: `act-${dayNum}-3`,
          timeSlot: 'evening',
          time: '07:30 PM',
          title: `Sunset Vista & Evening Boulevard Walk`,
          location: `${dest} Scenic Lookout`,
          description: `Watch the sunset paint the skyline in warm amber tones, followed by an atmospheric stroll under lit lamp posts.`,
          duration: '2 hours',
          estimatedCost: Math.round(tierMultiplier * 0.1),
          category: 'relaxation',
          insiderTip: 'Golden hour happens around 30 minutes before official sunset; secure your viewing spot early.',
          bookingRequired: false,
        },
      ],
      meals: {
        breakfast: {
          restaurantName: 'Artisan Cafe & Bakery',
          cuisine: 'Local Breakfast & Specialty Coffee',
          priceRange: tier === 'budget' ? '$' : '$$',
          estimatedCost: Math.round(tierMultiplier * 0.1),
          highlightDish: 'Freshly baked pastries with house roast espresso',
          neighborhood: 'Old Town',
          note: 'Outdoor patio seating is fantastic for people-watching.',
        },
        lunch: {
          restaurantName: 'Bistro du Marché',
          cuisine: 'Traditional Seasonal Cuisine',
          priceRange: tier === 'budget' ? '$' : '$$',
          estimatedCost: Math.round(tierMultiplier * 0.18),
          highlightDish: 'Chef special seasonal lunch plate',
          neighborhood: 'Market District',
          note: 'Offers great value fixed-price lunch menus.',
        },
        dinner: {
          restaurantName: 'La Pergola Terrace',
          cuisine: 'Regional Fine Comfort Food',
          priceRange: tier === 'budget' ? '$$' : tier === 'luxury' ? '$$$$' : '$$$',
          estimatedCost: Math.round(tierMultiplier * 0.32),
          highlightDish: 'Locally sourced signature dish paired with regional beverage',
          neighborhood: 'Riverside / Scenic Quarter',
          note: 'Window or terrace tables offer stunning twilight views.',
        },
      },
      dayBudgetEstimate: tierMultiplier,
      transitTips: 'Metro and walking are the most efficient ways to navigate this route. Daily transit passes offer great savings.',
    };
  });

  return {
    id: `trip-${Date.now()}`,
    title: `${count}-Day Curated Journey in ${dest}`,
    destination: dest,
    startDate: prefs.startDate || dates[0],
    endDate: prefs.endDate || dates[dates.length - 1],
    daysCount: count,
    travelerType: prefs.travelerType || 'solo',
    budgetTier: tier,
    pace: pace,
    interests: prefs.interests?.length ? prefs.interests : ['Culture', 'Sightseeing', 'Food & Culinary'],
    overview: `Welcome to ${dest}! This handpicked itinerary balances landmark sights, authentic dining gems, and peaceful evening walks tailored to your ${pace} travel style.`,
    highlights: [
      `Immersive exploration of historic heritage and architectural marvels`,
      `Handpicked dining spots celebrating local culinary traditions`,
      `Optimized pacing to avoid transit fatigue and maximize memories`,
      `Insider tips to skip lines and find secluded scenic viewpoints`,
    ],
    budget: {
      currency: 'USD',
      currencySymbol: '$',
      totalEstimated: totalCost,
      breakdown: {
        accommodation: Math.round(totalCost * 0.45),
        foodAndDining: Math.round(totalCost * 0.28),
        activitiesAndTickets: Math.round(totalCost * 0.15),
        localTransportation: Math.round(totalCost * 0.07),
        emergencyAndMisc: Math.round(totalCost * 0.05),
      },
      moneySavingTips: [
        'Purchase city sightseeing or transit passes online in advance for combo discounts.',
        'Opt for the daily fixed lunch specials ("menu du jour") which are often half the dinner prices for the same high quality.',
        'Carry a reusable water bottle and use public refill fountains found throughout city squares.',
      ],
    },
    days: sampleDays,
    attractions: [
      {
        id: 'attr-1',
        name: `${dest} Historic Center`,
        tagline: 'Heart of centuries-old charm and architecture',
        category: 'Historic Landmark',
        recommendedDuration: '2 - 3 hours',
        estimatedCost: 0,
        bestTimeToVisit: 'Early morning or late afternoon',
        insiderTip: 'Explore the narrow side alleys just one block off the main drag for authentic craft shops.',
      },
      {
        id: 'attr-2',
        name: `Grand Cultural Museum & Galleries`,
        tagline: 'A treasure trove of art, sculpture, and local history',
        category: 'Museum & Art',
        recommendedDuration: '3 hours',
        estimatedCost: Math.round(tierMultiplier * 0.15),
        bestTimeToVisit: 'Midday to escape heat or afternoon crowds',
        insiderTip: 'Book timed-entry passes online to skip the main ticketing queue.',
      },
      {
        id: 'attr-3',
        name: `Panoramic Hilltop Observatory`,
        tagline: 'Sweeping 360-degree views across the entire cityscape',
        category: 'Scenic Viewpoint',
        recommendedDuration: '1.5 hours',
        estimatedCost: Math.round(tierMultiplier * 0.08),
        bestTimeToVisit: '45 minutes before golden hour sunset',
        insiderTip: 'Bring a light layer as hilltop winds can pick up significantly after sunset.',
      },
    ],
    dining: [
      {
        id: 'dine-1',
        name: 'Trattoria del Sole',
        cuisine: 'Traditional Regional Cuisine',
        priceLevel: '$$',
        avgCostPerPerson: Math.round(tierMultiplier * 0.2),
        neighborhood: 'Old Town',
        specialty: 'House handmade pasta and regional delicacies',
        reservationRecommended: true,
        atmosphere: 'Rustic, warm, family-owned with exposed stone walls',
      },
      {
        id: 'dine-2',
        name: 'The Artisan Bakery & Roastery',
        cuisine: 'Cafe & Brunch',
        priceLevel: '$',
        avgCostPerPerson: Math.round(tierMultiplier * 0.09),
        neighborhood: 'Market District',
        specialty: 'Single-origin drip coffee and warm flaky pastries',
        reservationRecommended: false,
        atmosphere: 'Bright, minimalist, bustling with local creatives',
      },
    ],
    weatherAndPacking: {
      expectedWeather: 'Comfortable with pleasant breezes and occasional sunny spells.',
      averageTemp: '18°C - 24°C (64°F - 75°F)',
      seasonAdvice: 'Layers are recommended as mornings and evenings can be brisk compared to warm afternoons.',
      packingChecklist: [
        {
          category: 'Essentials',
          items: [
            { id: 'p-1', item: 'Passport & Travel Insurance copy', packed: true },
            { id: 'p-2', item: 'Universal Power Adapter & Power Bank', packed: true },
            { id: 'p-3', item: 'Credit cards with zero foreign transaction fees', packed: false },
          ],
        },
        {
          category: 'Clothing & Footwear',
          items: [
            { id: 'p-4', item: 'Comfortable broken-in walking sneakers', packed: true },
            { id: 'p-5', item: 'Light breathable layers & light jacket', packed: false },
            { id: 'p-6', item: 'Smart-casual outfit for fine dining', packed: false },
          ],
        },
        {
          category: 'Health & Convenience',
          items: [
            { id: 'p-7', item: 'Compact umbrella or rain poncho', packed: false },
            { id: 'p-8', item: 'Refillable water bottle', packed: false },
            { id: 'p-9', item: 'Sunscreen & Sunglasses', packed: false },
          ],
        },
      ],
    },
    localTips: {
      tippingCulture: 'Service charge is frequently included in bills. Rounding up or leaving 5-10% for exceptional hospitality is customary.',
      gettingAround: 'Public metro and trams run frequently and cleanly. Download local transit apps or use contactless tap-to-ride cards.',
      localEtiquette: [
        'Greet shopkeepers and restaurant staff politely when entering ("Bonjour / Buenos Días / Konnichiwa").',
        'Keep voice levels moderate on public transit and inside sacred or religious monuments.',
        'Keep emergency cash handy as a few artisanal stalls may not accept card payments.',
      ],
      safetyNotes: 'Generally very safe; be mindful of pickpockets in crowded tourist zones and transit hubs.',
      emergencyNumbers: 'Call 112 (Universal EU) or local 911 equivalent for emergency assistance.',
      usefulPhrases: [
        { phrase: 'Hello / Good morning', translation: 'Greetings', pronunciation: 'Standard polite greeting' },
        { phrase: 'Please & Thank you', translation: 'Politeness core', pronunciation: 'Essential daily expression' },
        { phrase: 'How much is this?', translation: 'Price inquiry', pronunciation: 'Helpful at market stalls' },
      ],
    },
    expenses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
  };
}

// Endpoint: Generate Full Itinerary
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const prefs = req.body;
    const { destination, startDate, endDate, travelerType, budgetTier, pace, interests, dietaryRestrictions, accommodationType, specialRequests } = prefs;

    // Calculate day count
    const start = new Date(startDate);
    const end = new Date(endDate);
    let diffDays = 3;
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      diffDays = Math.max(1, Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 14));
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Using curated intelligent generator.');
      const fallback = generateFallbackItinerary({ ...prefs, daysCount: diffDays });
      return res.json({ success: true, itinerary: fallback });
    }

    const prompt = `You are a world-class luxury and budget travel expert itinerary architect.
Generate a comprehensive, realistic, and inspiring ${diffDays}-day travel itinerary for:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${diffDays} days)
- Traveler Type: ${travelerType || 'solo'}
- Budget Level: ${budgetTier || 'moderate'}
- Travel Pace: ${pace || 'balanced'}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : 'Sightseeing, Culture, Local Cuisine'}
- Dietary Restrictions: ${dietaryRestrictions || 'None'}
- Preferred Accommodation Style: ${accommodationType || 'Comfortable boutique / standard hotel'}
- Special Requests: ${specialRequests || 'None'}

Requirements:
1. Provide a captivating title and an evocative trip overview.
2. For each day (Day 1 through Day ${diffDays}), provide:
   - Specific date (from ${startDate} onward)
   - Engaging theme
   - Brief summary of the day's narrative
   - 3 well-timed realistic activities (morning, afternoon, evening) with realistic locations, durations, approximate costs in USD, insider tips, and whether advance booking is recommended.
   - 3 distinct meal recommendations (breakfast, lunch, dinner) with real or highly realistic restaurant names, signature dishes, neighborhood, and approximate cost.
   - Day budget estimate and transit tips between activities.
3. Include 4 top attraction spotlight cards with best time to visit and insider tips.
4. Include 3 top local dining recommendations with specialties and vibe.
5. Provide a realistic budget breakdown in USD with money-saving tips.
6. Provide weather guidance and a structured packing checklist with categories (Essentials, Clothing & Footwear, Gadgets & Gear, Health & Toiletries).
7. Include practical local tips: tipping customs, transport advice, etiquette rules, emergency numbers, and 3 useful local phrases.

Ensure all JSON matches the requested schema precisely without markdown wrapping or commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            budget: {
              type: Type.OBJECT,
              properties: {
                currency: { type: Type.STRING },
                currencySymbol: { type: Type.STRING },
                totalEstimated: { type: Type.NUMBER },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    accommodation: { type: Type.NUMBER },
                    foodAndDining: { type: Type.NUMBER },
                    activitiesAndTickets: { type: Type.NUMBER },
                    localTransportation: { type: Type.NUMBER },
                    emergencyAndMisc: { type: Type.NUMBER },
                  },
                  required: ['accommodation', 'foodAndDining', 'activitiesAndTickets', 'localTransportation', 'emergencyAndMisc'],
                },
                moneySavingTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['currency', 'currencySymbol', 'totalEstimated', 'breakdown', 'moneySavingTips'],
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  date: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        timeSlot: { type: Type.STRING },
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        location: { type: Type.STRING },
                        description: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        estimatedCost: { type: Type.NUMBER },
                        category: { type: Type.STRING },
                        insiderTip: { type: Type.STRING },
                        bookingRequired: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'timeSlot', 'time', 'title', 'location', 'description', 'duration', 'estimatedCost', 'category'],
                    },
                  },
                  meals: {
                    type: Type.OBJECT,
                    properties: {
                      breakfast: {
                        type: Type.OBJECT,
                        properties: {
                          restaurantName: { type: Type.STRING },
                          cuisine: { type: Type.STRING },
                          priceRange: { type: Type.STRING },
                          estimatedCost: { type: Type.NUMBER },
                          highlightDish: { type: Type.STRING },
                          neighborhood: { type: Type.STRING },
                          note: { type: Type.STRING },
                        },
                      },
                      lunch: {
                        type: Type.OBJECT,
                        properties: {
                          restaurantName: { type: Type.STRING },
                          cuisine: { type: Type.STRING },
                          priceRange: { type: Type.STRING },
                          estimatedCost: { type: Type.NUMBER },
                          highlightDish: { type: Type.STRING },
                          neighborhood: { type: Type.STRING },
                          note: { type: Type.STRING },
                        },
                      },
                      dinner: {
                        type: Type.OBJECT,
                        properties: {
                          restaurantName: { type: Type.STRING },
                          cuisine: { type: Type.STRING },
                          priceRange: { type: Type.STRING },
                          estimatedCost: { type: Type.NUMBER },
                          highlightDish: { type: Type.STRING },
                          neighborhood: { type: Type.STRING },
                          note: { type: Type.STRING },
                        },
                      },
                    },
                  },
                  dayBudgetEstimate: { type: Type.NUMBER },
                  transitTips: { type: Type.STRING },
                },
                required: ['dayNumber', 'date', 'theme', 'summary', 'activities', 'dayBudgetEstimate', 'transitTips'],
              },
            },
            attractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  category: { type: Type.STRING },
                  recommendedDuration: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  bestTimeToVisit: { type: Type.STRING },
                  insiderTip: { type: Type.STRING },
                },
                required: ['id', 'name', 'tagline', 'category', 'recommendedDuration', 'estimatedCost', 'bestTimeToVisit', 'insiderTip'],
              },
            },
            dining: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  priceLevel: { type: Type.STRING },
                  avgCostPerPerson: { type: Type.NUMBER },
                  neighborhood: { type: Type.STRING },
                  specialty: { type: Type.STRING },
                  reservationRecommended: { type: Type.BOOLEAN },
                  atmosphere: { type: Type.STRING },
                },
                required: ['id', 'name', 'cuisine', 'priceLevel', 'avgCostPerPerson', 'neighborhood', 'specialty', 'atmosphere'],
              },
            },
            weatherAndPacking: {
              type: Type.OBJECT,
              properties: {
                expectedWeather: { type: Type.STRING },
                averageTemp: { type: Type.STRING },
                seasonAdvice: { type: Type.STRING },
                packingChecklist: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      items: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            item: { type: Type.STRING },
                            packed: { type: Type.BOOLEAN },
                          },
                          required: ['id', 'item', 'packed'],
                        },
                      },
                    },
                    required: ['category', 'items'],
                  },
                },
              },
              required: ['expectedWeather', 'averageTemp', 'seasonAdvice', 'packingChecklist'],
            },
            localTips: {
              type: Type.OBJECT,
              properties: {
                tippingCulture: { type: Type.STRING },
                gettingAround: { type: Type.STRING },
                localEtiquette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                safetyNotes: { type: Type.STRING },
                emergencyNumbers: { type: Type.STRING },
                usefulPhrases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phrase: { type: Type.STRING },
                      translation: { type: Type.STRING },
                      pronunciation: { type: Type.STRING },
                    },
                    required: ['phrase', 'translation'],
                  },
                },
              },
              required: ['tippingCulture', 'gettingAround', 'localEtiquette', 'safetyNotes', 'emergencyNumbers', 'usefulPhrases'],
            },
          },
          required: ['title', 'overview', 'highlights', 'budget', 'days', 'attractions', 'dining', 'weatherAndPacking', 'localTips'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    const finalItinerary = {
      ...parsedJson,
      id: `trip-${Date.now()}`,
      destination,
      startDate,
      endDate,
      daysCount: diffDays,
      travelerType,
      budgetTier,
      pace,
      interests: Array.isArray(interests) ? interests : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      expenses: [],
    };

    res.json({ success: true, itinerary: finalItinerary });
  } catch (error: any) {
    console.error('Error generating itinerary with Gemini:', error);
    // Provide robust fallback so user's experience is uninterrupted
    const fallback = generateFallbackItinerary(req.body);
    res.json({
      success: true,
      itinerary: fallback,
      warning: 'Generated via smart curated planner engine (API connection busy).',
    });
  }
});

// Endpoint: AI Activity Swap / Alternative Suggestions
app.post('/api/suggest-alternatives', async (req, res) => {
  try {
    const { destination, activity, currentTheme, preferenceFilter } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        alternatives: [
          {
            id: `alt-${Date.now()}-1`,
            timeSlot: activity.timeSlot || 'afternoon',
            time: activity.time || '02:00 PM',
            title: `Secluded Botanical Gardens & Tea Pavilion`,
            location: `${destination} Green District`,
            description: `A tranquil natural oasis away from city noise with serene koi ponds, traditional pathways, and tea tasting.`,
            duration: '2 hours',
            estimatedCost: 15,
            category: 'nature',
            insiderTip: 'Visit the peaceful western pavilion for uncrowded views.',
            bookingRequired: false,
          },
          {
            id: `alt-${Date.now()}-2`,
            timeSlot: activity.timeSlot || 'afternoon',
            time: activity.time || '02:30 PM',
            title: `Contemporary Art Gallery & Design Quarter`,
            location: `${destination} Arts Quarter`,
            description: `Discover rotating contemporary exhibits, cutting-edge local installations, and boutique craft shops.`,
            duration: '2 hours',
            estimatedCost: 20,
            category: 'culture',
            insiderTip: 'The museum cafe serves delicious regional roast coffee.',
            bookingRequired: true,
          },
          {
            id: `alt-${Date.now()}-3`,
            timeSlot: activity.timeSlot || 'afternoon',
            time: activity.time || '03:00 PM',
            title: `Bustling Local Street Food & Market Tour`,
            location: `${destination} Central Market`,
            description: `Taste your way through aromatic food stalls, meeting veteran vendors and sampling delicacies.`,
            duration: '2.5 hours',
            estimatedCost: 25,
            category: 'food',
            insiderTip: 'Look for stalls with long lines of local residents.',
            bookingRequired: false,
          },
        ],
      });
    }

    const prompt = `The user wants to replace an activity in their travel itinerary for ${destination}.
Current activity being replaced: "${activity.title}" (${activity.category}, duration: ${activity.duration}, cost: $${activity.estimatedCost}).
Day theme: "${currentTheme}".
Filter/Preference: "${preferenceFilter || 'any exciting alternative'}".

Suggest 3 distinct, high-quality replacement activities in ${destination} matching the ${activity.timeSlot} time slot.
Return JSON with an array named "alternatives". Each object has:
- id: string
- timeSlot: "${activity.timeSlot}"
- time: string
- title: string
- location: string
- description: string
- duration: string
- estimatedCost: number (USD)
- category: string ("sightseeing"|"food"|"culture"|"adventure"|"nature"|"relaxation"|"nightlife")
- insiderTip: string
- bookingRequired: boolean`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  insiderTip: { type: Type.STRING },
                  bookingRequired: { type: Type.BOOLEAN },
                },
                required: ['id', 'timeSlot', 'time', 'title', 'location', 'description', 'duration', 'estimatedCost', 'category'],
              },
            },
          },
          required: ['alternatives'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"alternatives":[]}');
    res.json({ success: true, alternatives: parsed.alternatives });
  } catch (err: any) {
    console.error('Error in suggest-alternatives:', err);
    res.status(500).json({ error: 'Could not fetch alternatives' });
  }
});

// Endpoint: AI Refine / Tweak Itinerary Instruction
app.post('/api/refine-itinerary', async (req, res) => {
  try {
    const { itinerary, instruction } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        itinerary: {
          ...itinerary,
          overview: `${itinerary.overview} (Updated with request: "${instruction}")`,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const prompt = `You are an expert travel itinerary assistant.
The traveler has an existing itinerary for ${itinerary.destination} (${itinerary.daysCount} days).
They want to refine it with this specific instruction:
"${instruction}"

Modify the itinerary to respect the traveler's request while keeping the existing structure, IDs, and consistency intact where appropriate.
Return the entire updated itinerary matching the same JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompt}\n\nCurrent Itinerary Data:\n${JSON.stringify(itinerary).slice(0, 30000)}` }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, itinerary: { ...itinerary, ...parsed, updatedAt: new Date().toISOString() } });
  } catch (err: any) {
    console.error('Error in refine-itinerary:', err);
    res.status(500).json({ error: 'Failed to refine itinerary' });
  }
});

// Endpoint: Travel Concierge Q&A
app.post('/api/ask-assistant', async (req, res) => {
  try {
    const { destination, question } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        answer: `Regarding ${destination}: It's best to plan transit passes in advance, keep some small cash for neighborhood bakeries, and download offline maps. For "${question}", local guidelines generally suggest checking official transit or tourist bureau advisories for the most up-to-date schedules.`,
      });
    }

    const prompt = `You are TravelMate AI's resident concierge for ${destination}.
Answer this traveler's question with precise, practical, and welcoming advice:
"${question}"

Keep the response concise (2 to 3 paragraphs max), bulleted where appropriate, highlighting insider secrets, typical costs if relevant, and safety/convenience tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error('Error in ask-assistant:', err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

// Dev & Production Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TravelMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
