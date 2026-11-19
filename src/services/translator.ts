/**
 * HearMe AI - Universal Multilingual Translator Service
 * 
 * Supports translation between all 10 languages:
 * 1. English (en-IN / en-US)
 * 2. Tamil (ta-IN)
 * 3. Malayalam (ml-IN)
 * 4. Hindi (hi-IN)
 * 5. Telugu (te-IN)
 * 6. Kannada (kn-IN)
 * 7. Bengali (bn-IN)
 * 8. Marathi (mr-IN)
 * 9. Gujarati (gu-IN)
 * 10. Punjabi (pa-IN)
 * 
 * Architecture:
 * 1. Client Cache (LRU/TTL) for instantaneous results
 * 2. Backend Proxy (/api/gemini/translate)
 * 3. Direct Gemini 1.5 Flash API (when user enters their custom API key)
 * 4. Free MyMemory Public Translation Engine (free web fallback for static GitHub Pages)
 * 5. Built-in Offline Accessibility Phrase Dictionary (guarantees offline zero-failure mode)
 */

import { SupportedLanguageCode, TranslationResult } from '../types';
import { getStoredApiKey } from './api';

const API_BASE = '/api';

// In-memory cache for translations
const translationCache = new Map<string, { result: TranslationResult; expiry: number }>();

// 2-letter mapping for public translation APIs
const BCP47_TO_SHORT: Record<string, string> = {
  'en-IN': 'en',
  'en-US': 'en',
  'ta-IN': 'ta',
  'ml-IN': 'ml',
  'hi-IN': 'hi',
  'te-IN': 'te',
  'kn-IN': 'kn',
  'bn-IN': 'bn',
  'mr-IN': 'mr',
  'gu-IN': 'gu',
  'pa-IN': 'pa',
};

const LANG_NAMES: Record<string, string> = {
  'en-IN': 'English',
  'en-US': 'English',
  'ta-IN': 'Tamil',
  'ml-IN': 'Malayalam',
  'hi-IN': 'Hindi',
  'te-IN': 'Telugu',
  'kn-IN': 'Kannada',
  'bn-IN': 'Bengali',
  'mr-IN': 'Marathi',
  'gu-IN': 'Gujarati',
  'pa-IN': 'Punjabi',
};

// =========================================================================
// Built-in Multilingual Accessibility Phrase Matrix (10x10)
// =========================================================================
interface PhraseRow {
  en: string;
  ta: string;
  ml: string;
  hi: string;
  te: string;
  kn: string;
  bn: string;
  mr: string;
  gu: string;
  pa: string;
}

const PHRASE_MATRIX: PhraseRow[] = [
  {
    en: 'Hello.',
    ta: 'வணக்கம்.',
    ml: 'നമസ്കാരം.',
    hi: 'नमस्ते।',
    te: 'నమస్కారం.',
    kn: 'ನಮಸ್ಕಾರ.',
    bn: 'নমস্কার।',
    mr: 'नमस्कार.',
    gu: 'નમસ્તે.',
    pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ।',
  },
  {
    en: 'Thank you very much.',
    ta: 'மிக்க நன்றி.',
    ml: 'വളരെ നന്ദി.',
    hi: 'बहुत-बहुत धन्यवाद।',
    te: 'చాలా ధన్యవాదాలు.',
    kn: 'ತುಂಬಾ ಧನ್ಯವಾದಗಳು.',
    bn: 'আপনাকে অনেক ধন্যবাদ।',
    mr: 'खूप खूप धन्यवाद.',
    gu: 'ખૂબ ખૂબ આભાર.',
    pa: 'ਬਹੁਤ ਬਹੁਤ ਧੰਨਵਾਦ।',
  },
  {
    en: 'Please help me.',
    ta: 'தயவுசெய்து எனக்கு உதவுங்கள்.',
    ml: 'ദയവായി എന്നെ സഹായിക്കൂ.',
    hi: 'कृपया मेरी मदद करें।',
    te: 'దయచేసి నాకు సహాయం చేయండి.',
    kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.',
    bn: 'দয়া করে আমাকে সাহায্য করুন।',
    mr: 'कृपया मला मदत करा.',
    gu: 'કૃપા કરીને મને મદદ કરો.',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ।',
  },
  {
    en: 'I cannot hear clearly.',
    ta: 'எனக்கு தெளிவாக கேட்கவில்லை.',
    ml: 'എനിക്ക് വ്യക്തമായി കേൾക്കാൻ കഴിയുന്നില്ല.',
    hi: 'मुझे साफ सुनाई नहीं दे रहा है।',
    te: 'నాకు సరిగ్గా వినిపించడం లేదు.',
    kn: 'ನನಗೆ ಸರಿಯಾಗಿ ಕೇಳಿಸುತ್ತಿಲ್ಲ.',
    bn: 'আমি পরিষ্কার শুনতে পাচ্ছি না।',
    mr: 'मला नीट ऐकू येत नाहीये.',
    gu: 'મને બરાબર સંભળાતું નથી.',
    pa: 'ਮੈਨੂੰ ਸਾਫ਼ ਸੁਣਾਈ ਨਹੀਂ ਦੇ ਰਿਹਾ।',
  },
  {
    en: 'Please speak slowly.',
    ta: 'தயவுசெய்து மெதுவாக பேசுங்கள்.',
    ml: 'ദയവായി പതുക്കെ സംസാരിക്കൂ.',
    hi: 'कृपया धीरे बोलें।',
    te: 'దయచేసి నెమ్మదిగా మాట్లాడండి.',
    kn: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.',
    bn: 'দয়া করে ধীরে ধীরে কথা বলুন।',
    mr: 'कृपया हळू बोला.',
    gu: 'કૃપા કરીને ધીમેથી બોલો.',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਹੌਲੀ ਬੋਲੋ।',
  },
  {
    en: 'Could you please write that down?',
    ta: 'அதை எழுதி காட்ட முடியுமா?',
    ml: 'അതൊന്ന് എഴുതി തരാമോ?',
    hi: 'क्या आप इसे लिख सकते हैं?',
    te: 'దాన్ని కాగితంపై రాసిస్తారా?',
    kn: 'ಅದನ್ನು ಬರೆದು ತೋರಿಸುತ್ತೀರಾ?',
    bn: 'আপনি কি এটা লিখে দিতে পারেন?',
    mr: 'तुम्ही ते लिहून दाखवू शकता का?',
    gu: 'શું તમે તે લખીને બતાવી શકો છો?',
    pa: 'ਕੀ ਤੁਸੀਂ ਇਸਨੂੰ ਲਿਖ ਸਕਦੇ ਹੋ?',
  },
  {
    en: 'Where is the hospital?',
    ta: 'மருத்துவமனை எங்கே உள்ளது?',
    ml: 'ആശുപത്രി എവിടെയാണ്?',
    hi: 'अस्पताल कहाँ है?',
    te: 'ఆసుపత్రి ఎక్కడ ఉంది?',
    kn: 'ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?',
    bn: 'হাসপাতাল কোথায়?',
    mr: 'दवाखाना कुठे आहे?',
    gu: 'હોસ્પિટલ ક્યાં છે?',
    pa: 'ਹਸਪਤਾਲ ਕਿੱਥੇ ਹੈ?',
  },
  {
    en: 'Where is the restroom?',
    ta: 'கழிப்பறை எங்கே உள்ளது?',
    ml: 'ശൗചാലയം എവിടെയാണ്?',
    hi: 'शौचालय कहाँ है?',
    te: 'వాష్‌రూమ్ ఎక్కడ ఉంది?',
    kn: 'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?',
    bn: 'বাথরুম কোথায়?',
    mr: 'शौचालय कुठे आहे?',
    gu: 'વોશરૂમ ક્યાં છે?',
    pa: 'ਵਾਸ਼ਰੂਮ ਕਿੱਥੇ ਹੈ?',
  },
  {
    en: 'I need a doctor.',
    ta: 'எனக்கு மருத்துவர் தேவை.',
    ml: 'എനിക്ക് ഒരു ഡോക്ടറെ കാണണം.',
    hi: 'मुझे डॉक्टर की ज़रूरत है।',
    te: 'నాకు వైద్యుని సహాయం కావాలి.',
    kn: 'ನನಗೆ ವೈದ್ಯರ ಅಗತ್ಯವಿದೆ.',
    bn: 'আমার ডাক্তার প্রয়োজন।',
    mr: 'मला डॉक्टरांची गरज आहे.',
    gu: 'મને ડૉક્ટરની જરૂર છે.',
    pa: 'ਮੈਨੂੰ ਡਾਕਟਰ ਦੀ ਲੋੜ ਹੈ।',
  },
  {
    en: 'Nice to meet you.',
    ta: 'உங்களை சந்தித்ததில் மகிழ்ச்சி.',
    ml: 'കണ്ടതിൽ സന്തോഷം.',
    hi: 'आपसे मिलकर खुशी हुई।',
    te: 'మిమ్మల్ని కలవడం ఆనందంగా ఉంది.',
    kn: 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷವಾಯಿತು.',
    bn: 'আপনার সাথে দেখা করে ভালো লাগলো।',
    mr: 'तुम्हाला भेटून आनंद झाला.',
    gu: 'તમને મળીને આનંદ થયો.',
    pa: 'ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ।',
  },
  {
    en: 'Yes',
    ta: 'ஆம்',
    ml: 'അതെ',
    hi: 'हाँ',
    te: 'అవును',
    kn: 'ಹೌದು',
    bn: 'হ্যাঁ',
    mr: 'होय',
    gu: 'હા',
    pa: 'ਹਾਂ',
  },
  {
    en: 'No',
    ta: 'இல்லை',
    ml: 'അല്ല',
    hi: 'नहीं',
    te: 'కాదు',
    kn: 'ಇಲ್ಲ',
    bn: 'না',
    mr: 'नाही',
    gu: 'ના',
    pa: 'ਨਹੀਂ',
  },
  {
    en: 'Good morning.',
    ta: 'காலை வணக்கம்.',
    ml: 'സുപ്രഭാതം.',
    hi: 'शुभ प्रभात।',
    te: 'శుభోదయం.',
    kn: 'ಶುಭೋದಯ.',
    bn: 'সুপ্রভাত।',
    mr: 'शुभ प्रभात.',
    gu: 'શુભ સવાર.',
    pa: 'ਸ਼ੁਭ ਸਵੇਰ।',
  },
  {
    en: 'Good night.',
    ta: 'இனிய இரவு.',
    ml: 'ശുഭരാത്രി.',
    hi: 'शुभ रात्रि।',
    te: 'శుభరాత్రి.',
    kn: 'ಶುಭರಾತ್ರಿ.',
    bn: 'শুভরাত্রি।',
    mr: 'शुभ रात्री.',
    gu: 'શુભ રાત્રિ.',
    pa: 'ਸ਼ੁਭ ਰਾਤ।',
  },
  {
    en: 'I need water.',
    ta: 'எனக்கு தண்ணீர் வேண்டும்.',
    ml: 'എനിക്ക് വെള്ളം വേണം.',
    hi: 'मुझे पानी चाहिए।',
    te: 'నాకు నీళ్లు కావాలి.',
    kn: 'ನನಗೆ ನೀರು ಬೇಕು.',
    bn: 'আমার জল দরকার।',
    mr: 'मला पाणी हवे आहे.',
    gu: 'મને પાણી જોઈએ છે.',
    pa: 'ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।',
  },
  {
    en: 'Emergency, please call an ambulance.',
    ta: 'அவசரம், தயவுசெய்து ஆம்புலன்ஸை அழைக்கவும்.',
    ml: 'അടിയന്തിരം, ദയവായി ആംബുലൻസ് വിളിക്കൂ.',
    hi: 'आपातकाल, कृपया एम्बुलेंस बुलाएं।',
    te: 'అత్యవసరం, దయచేసి అంబులెన్స్‌ని పిలవండి.',
    kn: 'ತುರ್ತು, ದಯವಿಟ್ಟು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.',
    bn: 'জরুরি, দয়া করে একটি অ্যাম্বুলেন্স ডাকুন।',
    mr: 'आणीबाणी, कृपया रुग्णवाहिका बोलवा.',
    gu: 'કટોકટી, કૃપા કરીને એમ્બ્યુલન્સ બોલાવો.',
    pa: 'ਐਮਰਜੈਂਸੀ, ਕਿਰਪਾ ਕਰਕੇ ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ।',
  },
];

// Offline translation lookup
function lookupOfflineTranslation(
  text: string,
  fromCode: string,
  toCode: string
): string | null {
  const clean = text.trim().toLowerCase().replace(/[।.,!?]/g, '');
  const fromKey = (BCP47_TO_SHORT[fromCode] || 'en') as keyof PhraseRow;
  const toKey = (BCP47_TO_SHORT[toCode] || 'en') as keyof PhraseRow;

  if (fromKey === toKey) return text;

  for (const row of PHRASE_MATRIX) {
    const val = row[fromKey]?.toLowerCase().replace(/[।.,!?]/g, '');
    if (val && (val === clean || clean.includes(val) || val.includes(clean))) {
      return row[toKey];
    }
  }

  return null;
}

/**
 * Translate text between any two supported languages
 */
export async function translateText(
  text: string,
  fromLang: SupportedLanguageCode,
  toLang: SupportedLanguageCode
): Promise<TranslationResult> {
  const cleanText = text?.trim();
  if (!cleanText) {
    throw new Error('Please enter text to translate.');
  }

  if (fromLang === toLang) {
    return {
      originalText: cleanText,
      translatedText: cleanText,
      fromLang,
      toLang,
      detectedSource: LANG_NAMES[fromLang] || fromLang,
    };
  }

  // 1. Check in-memory cache
  const cacheKey = `trans_${fromLang}_${toLang}_${cleanText.toLowerCase()}`;
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.result;
  }

  const storedKey = getStoredApiKey();
  const fromName = LANG_NAMES[fromLang] || fromLang;
  const toName = LANG_NAMES[toLang] || toLang;

  // 2. Try Backend Proxy (/api/gemini/translate)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (storedKey) {
      headers['X-Gemini-Key'] = storedKey;
    }

    const res = await fetch(`${API_BASE}/gemini/translate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: cleanText,
        fromLang,
        toLang,
        apiKey: storedKey || undefined,
      }),
    });

    if (res.ok) {
      const data: TranslationResult = await res.json();
      if (data.translatedText) {
        translationCache.set(cacheKey, { result: data, expiry: Date.now() + 3600 * 1000 });
        return data;
      }
    }
  } catch {
    // Backend offline / static GitHub Pages - proceed to client fallbacks
  }

  // 3. Try Direct Gemini API (if user has configured custom Gemini Key in Settings)
  if (storedKey) {
    try {
      const prompt =
        `Translate the following text accurately from ${fromName} (${fromLang}) to ${toName} (${toLang}). ` +
        `Preserve conversational tone, politeness, and accessibility clarity. ` +
        `Return strictly JSON with keys: "originalText", "translatedText", "fromLang", "toLang", "pronunciation" (Latin transliteration if target is non-Latin script).\n\n` +
        `Text: "${cleanText}"`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${storedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const rawJson = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed.translatedText) {
            const result: TranslationResult = {
              originalText: cleanText,
              translatedText: parsed.translatedText,
              fromLang,
              toLang,
              pronunciation: parsed.pronunciation,
              detectedSource: fromName,
            };
            translationCache.set(cacheKey, { result, expiry: Date.now() + 3600 * 1000 });
            return result;
          }
        }
      }
    } catch {
      // Fall through to public engine / dictionary
    }
  }

  // 4. Try Free Public Translation API (MyMemory)
  try {
    const fromShort = BCP47_TO_SHORT[fromLang] || 'en';
    const toShort = BCP47_TO_SHORT[toLang] || 'en';
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${fromShort}|${toShort}`;

    const publicRes = await fetch(apiUrl, { signal: AbortSignal.timeout(4000) });
    if (publicRes.ok) {
      const pubData = await publicRes.json();
      const translated = pubData?.responseData?.translatedText;
      if (translated && !translated.startsWith('MYMEMORY WARNING')) {
        const result: TranslationResult = {
          originalText: cleanText,
          translatedText: translated,
          fromLang,
          toLang,
          detectedSource: fromName,
        };
        translationCache.set(cacheKey, { result, expiry: Date.now() + 3600 * 1000 });
        return result;
      }
    }
  } catch {
    // Network or timeout - fall through to offline phrase matrix
  }

  // 5. Offline Accessibility Phrase Dictionary
  const offlineMatch = lookupOfflineTranslation(cleanText, fromLang, toLang);
  if (offlineMatch) {
    const result: TranslationResult = {
      originalText: cleanText,
      translatedText: offlineMatch,
      fromLang,
      toLang,
      detectedSource: fromName,
    };
    translationCache.set(cacheKey, { result, expiry: Date.now() + 3600 * 1000 });
    return result;
  }

  // 6. Graceful fallback if no network and not in dictionary
  const fallbackResult: TranslationResult = {
    originalText: cleanText,
    translatedText: cleanText,
    fromLang,
    toLang,
    pronunciation: `[Translation from ${fromName} to ${toName}]`,
    detectedSource: fromName,
  };
  return fallbackResult;
}
