import {
  ROUTE_REGISTRY,
  SupportedLanguage,
  GuideAnswer,
  detectLanguage,
  matchDeterministicGuide
} from './navigationRegistry';

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIGuideService {
  private static apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
  private static model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  /**
   * Main entry point to process a user question and generate a verified navigation answer.
   */
  public static async answerUserQuery(
    query: string,
    preferredLang?: SupportedLanguage,
    history?: HistoryMessage[]
  ): Promise<GuideAnswer> {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return matchDeterministicGuide('', preferredLang);
    }

    const lang: SupportedLanguage = preferredLang || detectLanguage(cleanQuery);

    // If no API key is configured, instantly use deterministic engine
    const currentKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || this.apiKey;
    if (!currentKey) {
      return matchDeterministicGuide(cleanQuery, lang);
    }

    try {
      const aiResponse = await this.callGeminiAPI(cleanQuery, lang, currentKey, history);
      if (aiResponse) {
        // Validate destination against strict server allowlist
        let verifiedDestination: GuideAnswer['destination'] = null;
        if (aiResponse.destinationId && ROUTE_REGISTRY[aiResponse.destinationId]) {
          const dest = ROUTE_REGISTRY[aiResponse.destinationId];
          verifiedDestination = {
            id: dest.id,
            path: dest.path,
            title: dest.titles[lang] || dest.titles.en,
            actionLabel: dest.actionLabels[lang] || dest.actionLabels.en
          };
        }

        return {
          reply: aiResponse.reply,
          destination: verifiedDestination,
          suggestedFollowUps: Array.isArray(aiResponse.suggestedFollowUps) && aiResponse.suggestedFollowUps.length > 0
            ? aiResponse.suggestedFollowUps.slice(0, 4)
            : ['How do I report an emergency?', 'Track my SOS status', 'Emergency helpline numbers']
        };
      }
    } catch (error) {
      console.warn('[AIGuideService] Gemini call failed or timed out, falling back to deterministic guide:', error);
    }

    // Fail-safe graceful degradation
    return matchDeterministicGuide(cleanQuery, lang);
  }

  private static async callGeminiAPI(
    query: string,
    lang: SupportedLanguage,
    apiKey: string,
    history?: HistoryMessage[]
  ): Promise<{ reply: string; destinationId: string | null; suggestedFollowUps: string[] } | null> {
    const allowedDestinations = Object.keys(ROUTE_REGISTRY).join(', ');

    const systemInstruction = `
You are the FloodRelief AI Guide, a safe, friendly, and accessible website navigation assistant for the FloodRelief Coordination Management System.
Your job is to help citizens, volunteers, and rescue responders navigate the website and find official information.

CRITICAL BOUNDARIES & INSTRUCTIONS:
1. You are ONLY a website navigation and help assistant.
2. You CANNOT directly dispatch rescue boats, dispatch helicopters, modify emergency database records, delete requests, or predict flood water levels.
3. If the user is facing an immediate life-threatening emergency, urge them to call NDRF/SDRF at 1070 or 112, or submit an immediate SOS at the Emergency Form or Voice SOS.
4. You must NEVER invent, construct, or hallucinate URLs or external links.
5. If there is a relevant page on the site, you must provide ONLY its verified destination ID from the allowed list:
   Allowed Destination IDs: [${allowedDestinations}] or null.
6. The user query language is '${lang}'. You MUST reply in the same language (${
      lang === 'en' ? 'English' :
      lang === 'hi' ? 'Hindi' :
      lang === 'bn' ? 'Bengali' :
      lang === 'br' ? 'Bodo' : 'Assamese'
    }).
7. Keep answers concise (2 to 4 sentences), calm, and clear.
8. Output MUST be valid JSON with this exact schema:
{
  "reply": "string (the natural language answer)",
  "destinationId": "ONE_OF_THE_ALLOWED_IDS or null",
  "suggestedFollowUps": ["short prompt 1", "short prompt 2", "short prompt 3"]
}
`;

    // Construct conversation payload
    const contents: any[] = [];

    // Include recent history if provided (up to last 3 messages)
    if (Array.isArray(history)) {
      const recent = history.slice(-3);
      for (const msg of recent) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 600,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error status ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    try {
      const parsed = JSON.parse(rawText);
      return {
        reply: String(parsed.reply || ''),
        destinationId: parsed.destinationId && ROUTE_REGISTRY[parsed.destinationId] ? parsed.destinationId : null,
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : []
      };
    } catch {
      // If JSON parsing fails, extract clean text
      return {
        reply: rawText.replace(/```json|```/g, '').trim(),
        destinationId: null,
        suggestedFollowUps: []
      };
    }
  }
}

