import { Request, Response } from 'express';
import { AIGuideService } from '../services/ai/aiGuideService';
import { ROUTE_REGISTRY, SupportedLanguage } from '../services/ai/navigationRegistry';

const VALID_LANGS: SupportedLanguage[] = ['en', 'hi', 'bn', 'br', 'as'];

export class AIGuideController {
  /**
   * POST /api/v1/guide/chat
   * Ask the FloodRelief AI Guide a natural-language navigation question.
   */
  public static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, language, history } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'A valid non-empty message string is required.'
        });
        return;
      }

      if (message.length > 500) {
        res.status(400).json({
          success: false,
          error: 'Message length exceeds maximum allowed limit of 500 characters.'
        });
        return;
      }

      const lang: SupportedLanguage | undefined = VALID_LANGS.includes(language) ? language : undefined;

      const safeHistory = Array.isArray(history)
        ? history
            .filter((h: any) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
            .map((h: any) => ({ role: h.role, content: h.content.slice(0, 500) }))
            .slice(-4)
        : undefined;

      const result = await AIGuideService.answerUserQuery(message, lang, safeHistory);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[AIGuideController] Error processing chat query:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process navigation assistant query.'
      });
    }
  }

  /**
   * GET /api/v1/guide/routes
   * Returns list of approved public navigation destinations and default quick prompts.
   */
  public static async getApprovedRoutes(req: Request, res: Response): Promise<void> {
    try {
      const langParam = req.query.lang as string;
      const lang: SupportedLanguage = VALID_LANGS.includes(langParam as SupportedLanguage) ? (langParam as SupportedLanguage) : 'en';

      const publicRoutes = Object.values(ROUTE_REGISTRY)
        .filter((r) => r.isPublic)
        .map((r) => ({
          id: r.id,
          path: r.path,
          title: r.titles[lang] || r.titles.en,
          actionLabel: r.actionLabels[lang] || r.actionLabels.en,
          description: r.description[lang] || r.description.en
        }));

      const quickPromptsByLang: Record<SupportedLanguage, string[]> = {
        en: [
          'How do I report an emergency?',
          'How does Voice SOS work?',
          'Where can I track my SOS status?',
          'Find active relief shelters',
          'Emergency helpline numbers',
          'How do I join as a volunteer?',
          'Staff & responder sign in'
        ],
        hi: [
          'बाढ़ आपातकाल कैसे रिपोर्ट करें?',
          'वॉयस एसओएस कैसे काम करता है?',
          'एसओएस स्थिति कहाँ ट्रैक करें?',
          'राहत शिविर और शरणस्थल खोजें',
          'आपातकालीन हेल्पलाइन नंबर',
          'स्वयंसेवक के रूप में कैसे जुड़ें?',
          'बचाव टीम और कर्मचारी लॉगिन'
        ],
        bn: [
          'জরুরি অবস্থা কীভাবে রিপোর্ট করব?',
          'ভয়েস এসওএস কীভাবে কাজ করে?',
          'এসওএস স্ট্যাটাস কোথায় ট্র্যাক করব?',
          'ত্রাণ শিবির এবং আশ্রয়কেন্দ্র খুঁজুন',
          'জরুরি হেল্পলাইন নম্বরগুলো কী?',
          'স্বেচ্ছাসেবক হিসেবে কীভাবে যোগ দেব?',
          'উদ্ধারকারী দল ও কর্মী লগইন'
        ],
        br: [
          'आपत खौरां माबोरै हरनो?',
          'राव एसओएस माबोरै खामानि मावो?',
          'एसओएस थासारि बबेयाव नायनो?',
          'राहत केम्प नागिर',
          'आपत हेल्पलाइन नम्बर',
          'स्वयंसेवक जानानै माबोरै थांनो?',
          'उद्धार हान्जा लगिन'
        ],
        as: [
          'বানপানীৰ আবেদন কেনেকৈ দিম?',
          'ভইচ এছ অ\' এছ কেনেকৈ কাম কৰে?',
          'এছ অ\' এছ অৱস্থা ক\'ত চাম?',
          'আশ্ৰয় শিবিৰসমূহ বিচাৰক',
          'জৰুৰীকালীন হেল্পলাইন নম্বৰসমূহ',
          'স্বেচ্ছাসেৱক হিচাপে কেনেকৈ যোগদান কৰিম?',
          'কৰ্মচাৰী আৰু উদ্ধাৰকাৰী দলৰ প্ৰৱেশ'
        ]
      };

      res.status(200).json({
        success: true,
        data: {
          routes: publicRoutes,
          quickPrompts: quickPromptsByLang[lang] || quickPromptsByLang.en
        }
      });
    } catch (error: any) {
      console.error('[AIGuideController] Error fetching approved routes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve navigation routes.'
      });
    }
  }
}

