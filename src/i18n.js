import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav_home: "Home & Scanner",
      nav_result: "Diagnosis Result",
      nav_chat: "AI Agri Consultant",
      nav_stores: "Dealers & Stores",
      hero_badge: "Deep Learning Powered",
      hero_title_1: "Upload Crop Leaf Photo, ",
      hero_title_2: "Detect Disease & Cure",
      hero_title_3: " Instantly",
      hero_desc: "Accurately identify crop pathology using transfer-learned MobileNetV2 vision models and access certified chemical and organic treatment plans.",
      btn_upload: "Capture or Upload Leaf",
      click_hint: "Click on the banner image to select a file",
      drop_title: "Select an affected crop leaf",
      drop_desc: "Use your device camera directly or select an image from storage",
      btn_browse: "Browse Files",
      btn_detect: "Analyze Disease",
      btn_analyzing: "AI is analyzing...",
      btn_cancel: "Reset",
      btn_listen: "Listen Audio",
      btn_stop_listen: "Stop Audio",
      btn_pdf: "Download Prescription PDF",
      txt_confidence: "Confidence",
      txt_original_img: "Uploaded Leaf Image",
      txt_heatmap: "Grad-CAM Explainable AI Heatmap",
      txt_heatmap_desc: "Red/yellow highlights denote visual regions the AI utilized for diagnosis.",
      txt_symptoms: "Observed Symptoms",
      txt_medicines: "Prescribed Treatments & Dosages",
      txt_organic: "Organic & Preventive Care",
      txt_no_data: "No active scan found. Please scan an image on the Home page."
    }
  },
  bn: {
    translation: {
      nav_home: "হোম ও স্ক্যানার",
      nav_result: "ডায়াগনোসিস ফলাফল",
      nav_chat: "AI কৃষি পরামর্শক",
      nav_stores: "ডিলার ও দোকান",
      hero_badge: "ডিপ লার্নিং প্রযুক্তি",
      hero_title_1: "ফসলের পাতার ছবি দিন, ",
      hero_title_2: "রোগ ও প্রতিকার",
      hero_title_3: " জানুন মুহূর্তেই",
      hero_desc: "আধুনিক কম্পিউটার ভিশন মডেলের সাহায্যে দ্রুত রোগ নির্ণয় এবং অনুমোদিত ওষুধ ও পরিচর্যা নির্দেশিকা নিশ্চিত করুন।",
      btn_upload: "ছবি তুলুন বা আপলোড করুন",
      click_hint: "ছবি নির্বাচন করতে ব্যানারে ক্লিক করুন",
      drop_title: "আক্রান্ত পাতার ছবি নির্বাচন করুন",
      drop_desc: "ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা ফাইল থেকে বেছে নিন",
      btn_browse: "ফাইল ব্রাউজ করুন",
      btn_detect: "রোগ শনাক্ত করুন",
      btn_analyzing: "AI বিশ্লেষণ চলছে...",
      btn_cancel: "রিসেট",
      btn_listen: "বাংলায় শুনুন",
      btn_stop_listen: "ভয়েস বন্ধ করুন",
      btn_pdf: "প্রেসক্রিপশন PDF ডাউনলোড",
      txt_confidence: "নিখুঁততা",
      txt_original_img: "আসল পাতার ছবি",
      txt_heatmap: "Grad-CAM রোগাক্রান্ত অঞ্চল হিটম্যাপ",
      txt_heatmap_desc: "লাল ও হলুদ অংশ দেখে মডেল রোগ চিহ্নিত করেছে।",
      txt_symptoms: "রোগের লক্ষণ",
      txt_medicines: "প্রস্তাবিত ওষুধ ও প্রয়োগ মাত্রা",
      txt_organic: "জৈব ও প্রতিরোধমূলক পরিচর্যা",
      txt_no_data: "কোনো স্ক্যান ফলাফল নেই। অনুগ্রহ করে হোম পেজে ছবি আপলোড করুন।"
    }
  },
  hi: {
    translation: {
      nav_home: "होम और स्कैनर",
      nav_result: "निदान परिणाम",
      nav_chat: "AI कृषि सलाहकार",
      nav_stores: "विक्रेता व दुकानें",
      hero_badge: "डीप लर्निंग तकनीक",
      hero_title_1: "फसल की पत्ती की तस्वीर दें, ",
      hero_title_2: "रोग और उपचार",
      hero_title_3: " तुरंत जानें",
      hero_desc: "आर्टिफिशियल इंटेलिजेंस की सहायता से फसल रोगों की सटीक पहचान और दवा की सही मात्रा प्राप्त करें।",
      btn_upload: "तस्वीर लें या अपलोड करें",
      click_hint: "फ़ाइल चुनने के लिए बैनर पर क्लिक करें",
      drop_title: "संक्रमित पत्ती की तस्वीर चुनें",
      drop_desc: "सीधे कैमरे से फोटो लें या गैलरी से चुनें",
      btn_browse: "फ़ाइल चुनें",
      btn_detect: "रोग पहचानें",
      btn_analyzing: "AI विश्लेषण जारी है...",
      btn_cancel: "रीसेट",
      btn_listen: "आवाज़ में सुनें",
      btn_stop_listen: "आवाज़ बंद करें",
      btn_pdf: "प्रिस्क्रिप्शन PDF डाउनलोड",
      txt_confidence: "सटीकता",
      txt_original_img: "अपलोड की गई तस्वीर",
      txt_heatmap: "Grad-CAM AI प्रभावित क्षेत्र हीटमैप",
      txt_heatmap_desc: "लाल और पीले क्षेत्र से मॉडल ने रोग का विश्लेषण किया है।",
      txt_symptoms: "रोग के लक्षण",
      txt_medicines: "सुझाई गई दवाएं और मात्रा",
      txt_organic: "जैविक और निवारक देखभाल",
      txt_no_data: "कोई परिणाम नहीं मिला। कृपया होम पेज पर तस्वीर स्कैन करें।"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;