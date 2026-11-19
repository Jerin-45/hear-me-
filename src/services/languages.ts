/**
 * HearMe AI - Multilingual 10-Language Support System
 * 
 * Languages supported:
 * 1. English (India & Global) - en-IN
 * 2. Tamil (தமிழ்) - ta-IN
 * 3. Malayalam (മലയാളം) - ml-IN
 * 4. Hindi (हिन्दी) - hi-IN
 * 5. Telugu (తెలుగు) - te-IN
 * 6. Kannada (ಕನ್ನಡ) - kn-IN
 * 7. Bengali (বাংলা) - bn-IN
 * 8. Marathi (मराठी) - mr-IN
 * 9. Gujarati (ગુજરાતી) - gu-IN
 * 10. Punjabi (ਪੰਜਾਬੀ) - pa-IN
 */

import { SupportedLanguageCode } from '../types';

export interface LanguageInfo {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  shortLabel: string;
  flag: string;
  sampleGreeting: string;
  sampleTestSpeech: string;
  quickPhrases: string[];
}

export const TEN_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English (India)',
    shortLabel: 'EN',
    flag: '🇮🇳',
    sampleGreeting: 'Hello, welcome to HearMe AI.',
    sampleTestSpeech: 'Testing HearMe AI speech synthesis in English.',
    quickPhrases: [
      'Hello.',
      'Thank you very much.',
      'Please help me.',
      'I cannot hear clearly.',
      'Please speak slowly and face me.',
      'Could you please write that down?',
      'Where is the hospital?',
      'Where is the restroom?',
      'I need a doctor.',
      'Nice to meet you.',
    ],
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    shortLabel: 'தமிழ்',
    flag: '🇮🇳',
    sampleGreeting: 'வணக்கம், ஹியர்மீ AI-க்கு நல்வரவு.',
    sampleTestSpeech: 'ஹியர்மீ AI தமிழ் குரல் வெளியீடு சோதனை.',
    quickPhrases: [
      'வணக்கம்.',
      'மிக்க நன்றி.',
      'தயவுசெய்து எனக்கு உதவுங்கள்.',
      'எனக்கு தெளிவாக கேட்கவில்லை.',
      'தயவுசெய்து மெதுவாக பேசுங்கள்.',
      'அதை எழுதி காட்ட முடியுமா?',
      'மருத்துவமனை எங்கே உள்ளது?',
      'கழிப்பறை எங்கே உள்ளது?',
      'எனக்கு மருத்துவர் தேவை.',
      'உங்களை சந்தித்ததில் மகிழ்ச்சி.',
    ],
  },
  {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    shortLabel: 'മലയാളം',
    flag: '🇮🇳',
    sampleGreeting: 'നമസ്കാരം, ഹിയർമീ AI-ലേക്ക് സ്വാഗതം.',
    sampleTestSpeech: 'ഹിയർമീ AI മലയാളം ശബ്ദ ഔട്ട്പുട്ട് പരിശോധന.',
    quickPhrases: [
      'നമസ്കാരം.',
      'വളരെ നന്ദി.',
      'ദയവായി എന്നെ സഹായിക്കൂ.',
      'എനിക്ക് വ്യക്തമായി കേൾക്കാൻ കഴിയുന്നില്ല.',
      'ദയവായി പതുക്കെ സംസാരിക്കൂ.',
      'അതൊന്ന് എഴുതി തരാമോ?',
      'ആശുപത്രി എവിടെയാണ്?',
      'ശൗചാലയം എവിടെയാണ്?',
      'എനിക്ക് ഒരു ഡോക്ടറെ കാണണം.',
      'കണ്ടതിൽ സന്തോഷം.',
    ],
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    shortLabel: 'हिन्दी',
    flag: '🇮🇳',
    sampleGreeting: 'नमस्ते, हियरमी AI में आपका स्वागत है।',
    sampleTestSpeech: 'हियरमी AI हिन्दी वाक् आउटपुट परीक्षण।',
    quickPhrases: [
      'नमस्ते।',
      'बहुत-बहुत धन्यवाद।',
      'कृपया मेरी मदद करें।',
      'मुझे साफ सुनाई नहीं दे रहा है।',
      'कृपया धीरे बोलें।',
      'क्या आप इसे लिख सकते हैं?',
      'अस्पताल कहाँ है?',
      'शौचालय कहाँ है?',
      'मुझे डॉक्टर की ज़रूरत है।',
      'आपसे मिलकर खुशी हुई।',
    ],
  },
  {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    shortLabel: 'తెలుగు',
    flag: '🇮🇳',
    sampleGreeting: 'నమస్కారం, హియర్‌మీ AI కి స్వాగతం.',
    sampleTestSpeech: 'హియర్‌మీ AI తెలుగు వాయిస్ అవుట్‌పుట్ పరీక్ష.',
    quickPhrases: [
      'నమస్కారం.',
      'చాలా ధన్యవాదాలు.',
      'దయచేసి నాకు సహాయం చేయండి.',
      'నాకు సరిగ్గా వినిపించడం లేదు.',
      'దయచేసి నెమ్మదిగా మాట్లాడండి.',
      'దాన్ని కాగితంపై రాసిస్తారా?',
      'ఆసుపత్రి ఎక్కడ ఉంది?',
      'వాష్‌రూమ్ ఎక్కడ ఉంది?',
      'నాకు వైద్యుని సహాయం కావాలి.',
      'మిమ్మల్ని కలవడం ఆనందంగా ఉంది.',
    ],
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    shortLabel: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    sampleGreeting: 'ನಮಸ್ಕಾರ, ಹಿಯರ್‌ಮೀ AI ಗೆ ಸುಸ್ವಾಗತ.',
    sampleTestSpeech: 'ಹಿಯರ್‌ಮೀ AI ಕನ್ನಡ ಧ್ವನಿ ಔಟ್‌ಪುಟ್ ಪರೀಕ್ಷೆ.',
    quickPhrases: [
      'ನಮಸ್ಕಾರ.',
      'ತುಂಬಾ ಧನ್ಯವಾದಗಳು.',
      'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.',
      'ನನಗೆ ಸರಿಯಾಗಿ ಕೇಳಿಸುತ್ತಿಲ್ಲ.',
      'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.',
      'ಅದನ್ನು ಬರೆದು ತೋರಿಸುತ್ತೀರಾ?',
      'ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?',
      'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?',
      'ನನಗೆ ವೈದ್ಯರ ಅಗತ್ಯವಿದೆ.',
      'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷವಾಯಿತು.',
    ],
  },
  {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    shortLabel: 'বাংলা',
    flag: '🇮🇳',
    sampleGreeting: 'নমস্কার, হিয়ারমি AI-তে স্বাগতম।',
    sampleTestSpeech: 'হিয়ারমি AI বাংলা ভয়েস আউটপুট পরীক্ষা।',
    quickPhrases: [
      'নমস্কার।',
      'আপনাকে অনেক ধন্যবাদ।',
      'দয়া করে আমাকে সাহায্য করুন।',
      'আমি পরিষ্কার শুনতে পাচ্ছি না।',
      'দয়া করে ধীরে ধীরে কথা বলুন।',
      'আপনি কি এটা লিখে দিতে পারেন?',
      'হাসপাতাল কোথায়?',
      'বাথরুম কোথায়?',
      'আমার ডাক্তার প্রয়োজন।',
      'আপনার সাথে দেখা করে ভালো লাগলো।',
    ],
  },
  {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    shortLabel: 'मराठी',
    flag: '🇮🇳',
    sampleGreeting: 'नमस्कार, हिअरमी AI मध्ये आपले स्वागत आहे.',
    sampleTestSpeech: 'हिअरमी AI मराठी आवाज आउटपुट चाचणी.',
    quickPhrases: [
      'नमस्कार.',
      'खूप खूप धन्यवाद.',
      'कृपया मला मदत करा.',
      'मला नीट ऐकू येत नाहीये.',
      'कृपया हळू बोला.',
      'तुम्ही ते लिहून दाखवू शकता का?',
      'दवाखाना कुठे आहे?',
      'शौचालय कुठे आहे?',
      'मला डॉक्टरांची गरज आहे.',
      'तुम्हाला भेटून आनंद झाला.',
    ],
  },
  {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    shortLabel: 'ગુજરાતી',
    flag: '🇮🇳',
    sampleGreeting: 'નમસ્તે, હિયરમી AI માં આપનું સ્વાગત છે.',
    sampleTestSpeech: 'હિયરમી AI ગુજરાતી અવાજ આઉટપુટ ટેસ્ટ.',
    quickPhrases: [
      'નમસ્તે.',
      'ખૂબ ખૂબ આભાર.',
      'કૃપા કરીને મને મદદ કરો.',
      'મને બરાબર સંભળાતું નથી.',
      'કૃપા કરીને ધીમેથી બોલો.',
      'શું તમે તે લખીને બતાવી શકો છો?',
      'હોસ્પિટલ ક્યાં છે?',
      'વોશરૂમ ક્યાં છે?',
      'મને ડૉક્ટરની જરૂર છે.',
      'તમને મળીને આનંદ થયો.',
    ],
  },
  {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    shortLabel: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਹੀਅਰਮੀ AI ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।',
    sampleTestSpeech: 'ਹੀਅਰਮੀ AI ਪੰਜਾਬੀ ਆਵਾਜ਼ ਆਉਟਪੁੱਟ ਟੈਸਟ।',
    quickPhrases: [
      'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ।',
      'ਬਹੁਤ ਬਹੁਤ ਧੰਨਵਾਦ।',
      'ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ।',
      'ਮੈਨੂੰ ਸਾਫ਼ ਸੁਣਾਈ ਨਹੀਂ ਦੇ ਰਿਹਾ।',
      'ਕਿਰਪਾ ਕਰਕੇ ਹੌਲੀ ਬੋਲੋ।',
      'ਕੀ ਤੁਸੀਂ ਇਸਨੂੰ ਲਿਖ ਸਕਦੇ ਹੋ?',
      'ਹਸਪਤਾਲ ਕਿੱਥੇ ਹੈ?',
      'ਵਾਸ਼ਰੂਮ ਕਿੱਥੇ ਹੈ?',
      'ਮੈਨੂੰ ਡਾਕਟਰ ਦੀ ਲੋੜ ਹੈ।',
      'ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ।',
    ],
  },
];

export function getLanguageInfo(code: string): LanguageInfo {
  return (
    TEN_LANGUAGES.find((lang) => lang.code === code) ||
    TEN_LANGUAGES[0]
  );
}
