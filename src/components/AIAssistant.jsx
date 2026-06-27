import React, { useState, useEffect, useRef } from 'react';

// Translation dictionaries for the 7 supported languages
const translations = {
  en: {
    welcome: "Hello! I am your Zenith AI Assistant. How can I help you today?",
    askBalance: "What's my balance?",
    lockCard: "Lock credit card",
    showExpenses: "Show expenses",
    rechargeJio: "Recharge Jio",
    downloadStatement: "Download statement",
    confirm: "Confirm",
    cancel: "Cancel",
    pinPlaceholder: "Enter 4-Digit PIN",
    otpPlaceholder: "Enter 6-Digit OTP",
    submit: "Submit",
    listening: "Listening...",
    micBlocked: "Microphone blocked. Please check browser settings.",
    speechNotSupported: "Speech Recognition not supported in this browser.",
    verificationSuccess: "Verification Successful!",
    processing: "Processing..."
  },
  hi: {
    welcome: "नमस्ते! मैं आपका जेनिथ एआई सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    askBalance: "मेरा बैलेंस क्या है?",
    lockCard: "क्रेडिट कार्ड ब्लॉक करें",
    showExpenses: "खर्च दिखाएं",
    rechargeJio: "जियो रिचार्ज",
    downloadStatement: "स्टेटमेंट डाउनलोड करें",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    pinPlaceholder: "4-अंकों का पिन दर्ज करें",
    otpPlaceholder: "6-अंकों का ओटीपी दर्ज करें",
    submit: "जमा करें",
    listening: "सुन रहा हूँ...",
    micBlocked: "माइक्रोफोन अवरुद्ध है। कृपया ब्राउज़र सेटिंग्स जांचें।",
    speechNotSupported: "इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।",
    verificationSuccess: "सत्यापन सफल रहा!",
    processing: "प्रक्रिया जारी है..."
  },
  ta: {
    welcome: "வணக்கம்! நான் உங்கள் ஜெனித் ஏஐ உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    askBalance: "எனது இருப்பு என்ன?",
    lockCard: "கார்டை லாக் செய்",
    showExpenses: "செலவுகளைக் காட்டு",
    rechargeJio: "ஜியோ ரீசார்ஜ்",
    downloadStatement: "அறிக்கையைப் பதிவிறக்குக",
    confirm: "உறுதிப்படுத்து",
    cancel: "ரத்து செய்",
    pinPlaceholder: "4-இலக்க பின்னை உள்ளிடவும்",
    otpPlaceholder: "6-இலக்க OTP ஐ உள்ளிடவும்",
    submit: "சமர்ப்பி",
    listening: "கேட்கிறது...",
    micBlocked: "மைக்ரோஃபோன் தடுக்கப்பட்டது. அமைப்புகளை சரிபார்க்கவும்.",
    speechNotSupported: "இந்த உலாவியில் பேச்சு அங்கீகாரம் ஆதரிக்கப்படவில்லை.",
    verificationSuccess: "சரிபார்ப்பு வெற்றிகரமாக முடிந்தது!",
    processing: "செயலாக்கப்படுகிறது..."
  },
  te: {
    welcome: "నమస్తే! నేను మీ జెనిత్ AI అసిస్టెంట్. ఈరోజు మీకు ఎలా సహాయపడగలను?",
    askBalance: "నా బ్యాలెన్స్ ఎంత?",
    lockCard: "కార్డ్ లాక్ చేయండి",
    showExpenses: "ఖర్చులు చూపించు",
    rechargeJio: "జియో రీఛార్జ్",
    downloadStatement: "స్టేట్‌మెంట్ డౌన్‌లోడ్ చేయి",
    confirm: "ధృవీకరించు",
    cancel: "రద్దు చేయి",
    pinPlaceholder: "4-అంకెల PIN నమోదు చేయండి",
    otpPlaceholder: "6-అంకెల OTP నమోదు చేయండి",
    submit: "సమర్పించు",
    listening: "వింటున్నాను...",
    micBlocked: "మైక్రోఫోన్ నిరోధించబడింది. సెట్టింగులను తనిखీ చేయండి.",
    speechNotSupported: "ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ సపోర్ట్ లేదు.",
    verificationSuccess: "ధృవీకరణ విజయవంతమైంది!",
    processing: "ప్రాసెస్ అవుతోంది..."
  },
  bn: {
    welcome: "হ্যালো! আমি আপনার জেনিথ এআই অ্যাসিস্ট্যান্ট। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
    askBalance: "আমার ব্যালেন্স কত?",
    lockCard: "ক্রেডিট কার্ড লক করুন",
    showExpenses: "খরচ দেখান",
    rechargeJio: "জিও রিচার্জ",
    downloadStatement: "স্টেটমেন্ট ডাউনলোড করুন",
    confirm: "নিশ্চিত করুন",
    cancel: "বাতিল করুন",
    pinPlaceholder: "৪-সংখ্যার পিন লিখুন",
    otpPlaceholder: "৬-সংখ্যার ওটিপি লিখুন",
    submit: "জমা দিন",
    listening: "শুনছি...",
    micBlocked: "মাইক্রোফোন অবরুদ্ধ। অনুগ্রহ করে ব্রাউজার সেটিংস দেখুন।",
    speechNotSupported: "এই ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়।",
    verificationSuccess: "যাচাইকরণ সফল হয়েছে!",
    processing: "প্রক্রিয়াকরণ হচ্ছে..."
  },
  mr: {
    welcome: "नमस्कार! मी आपला जेनिथ एआय सहाय्यक आहे. आज मी आपली काय मदत करू शकतो?",
    askBalance: "माझे शिल्लक काय आहे?",
    lockCard: "क्रेडिट कार्ड ब्लॉक करा",
    showExpenses: "खर्च दाखवा",
    rechargeJio: "जिओ रिचार्ज",
    downloadStatement: "स्टेटमेंट डाउनलोड करा",
    confirm: "पुष्टी करा",
    cancel: "रद्द करा",
    pinPlaceholder: "४-अंकी पिन प्रविष्ट करा",
    otpPlaceholder: "६-अंकी ओटीपी प्रविष्ट करा",
    submit: "सादर करा",
    listening: "ऐकत आहे...",
    micBlocked: "मायक्रोफोन ब्लॉक केला आहे. कृपया सेटिंग्ज तपासा.",
    speechNotSupported: "या ब्राउझरमध्ये स्पीच रिकग्निशन स्पीच रिकग्निशन समर्थित नाही.",
    verificationSuccess: "पडताळणी यशस्वी झाली!",
    processing: "प्रक्रिया सुरू आहे..."
  },
  gu: {
    welcome: "નમસ્તે! હું તમારો ઝેનિથ એઆઈ સહાયક છું. આજે હું તમારી શું મદદ કરી શકું?",
    askBalance: "મારું બેલેન્સ શું છે?",
    lockCard: "ક્રેડિટ કાર્ડ લોક કરો",
    showExpenses: "ખર્ચ બતાવો",
    rechargeJio: "જીઓ રિચાર્જ",
    downloadStatement: "સ્ટેટમેન્ટ ડાઉનલોડ કરો",
    confirm: "પુષ્ટિ કરો",
    cancel: "રદ કરો",
    pinPlaceholder: "4-અંકનો પીન દાખલ કરો",
    otpPlaceholder: "6-અંકનો ઓટીપી દાખલ કરો",
    submit: "સબમિટ કરો",
    listening: "સાંભળી રહ્યું છે...",
    micBlocked: "માઇક્રોફોન બ્લોક કરેલ છે. કૃપા કરીને સેટિંગ્સ તપાસો.",
    speechNotSupported: "આ બ્રાઉઝરમાં સ્પીચ રેકગ્નિશન સપોર્ટેડ નથી.",
    verificationSuccess: "ચકાસણી સફળ થઈ!",
    processing: "પ્રોસેસિંગ..."
  },
  pa: {
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਜ਼ੈਨਿਥ ਏਆਈ ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    askBalance: "ਮੇਰਾ ਬੈਲੇਂਸ ਕੀ ਹੈ?",
    lockCard: "ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਬਲੌਕ ਕਰੋ",
    showExpenses: "ਖਰਚੇ ਦਿਖਾਓ",
    rechargeJio: "ਜੀਓ ਰੀਚਾਰਜ",
    downloadStatement: "ਸਟੇਟਮੈਂਟ ਡਾਊਨਲੋਡ ਕਰੋ",
    confirm: "ਪੁਸ਼ਟੀ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    pinPlaceholder: "4-ਅੰਕਾਂ ਦਾ ਪਿਨ ਦਰਜ ਕਰੋ",
    otpPlaceholder: "6-ਅੰਕਾਂ ਦਾ ਓਟੀਪੀ ਦਰਜ ਕਰੋ",
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ...",
    micBlocked: "ਮਾਈਕ੍ਰੋਫੋਨ ਬਲੌਕ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।",
    speechNotSupported: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਪੀਚ ਰਿਕਗਨੀਸ਼ਨ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।",
    verificationSuccess: "ਤਸਦੀਕ ਸਫਲ ਰਹੀ!",
    processing: "ਕਾਰਵਾਈ ਜਾਰੀ ਹੈ..."
  }
};

export default function AIAssistant({ 
  user, 
  accounts, 
  creditCard,
  currentPage,
  setCurrentPage, 
  onCardAction, 
  refreshAllData, 
  addNotification,
  accessibilitySettings,
  triggerBiometrics,
  setPrefilledPayment,
  setPrefilledInvestment,
  setPrefilledLoan,
  setPrefilledClaim
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);

  // Transaction PIN/OTP Flow inside Chat State
  const [pendingAction, setPendingAction] = useState(null); // 'transfer', 'recharge', 'freeze', 'reset-pin'
  const [flowStep, setFlowStep] = useState(0); // 0: idle, 1: confirm click, 2: PIN gate, 3: OTP gate, 4: completed
  const [pinValue, setPinValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [flowError, setFlowError] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Active language localization selector
  const activeLang = accessibilitySettings?.language || 'en';
  const t = translations[activeLang] || translations.en;

  // Initialize Welcome Message
  useEffect(() => {
    setMessages([
      { id: 'welcome', sender: 'bot', text: t.welcome }
    ]);
  }, [activeLang]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = activeLang === 'hi' ? 'hi-IN' : (activeLang === 'ta' ? 'ta-IN' : (activeLang === 'te' ? 'te-IN' : 'en-IN'));

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          alert(t.micBlocked);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [activeLang]);

  // Speech Synthesis Helper
  const speakText = (text) => {
    if (!textToSpeechEnabled) return;
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose voice based on language
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (activeLang === 'hi') {
      selectedVoice = voices.find(v => v.lang.includes('hi-IN'));
    } else {
      selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.includes('Google'));
    }
    if (selectedVoice) utterance.voice = selectedVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle listening
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert(t.speechNotSupported);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Core NLU query submission
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    if (!customText) {
      setInputValue('');
    }

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: textToSend }]);

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.map(m => ({
            sender: m.sender,
            text: m.text
          })),
          context: { currentPage }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add bot message
        setMessages(prev => [...prev, { 
          id: Date.now() + 1 + '', 
          sender: 'bot', 
          text: data.responseText,
          buttons: data.buttons,
          action: data.action,
          actionData: data.actionData
        }]);

        // Speak aloud if voice synthesising is active
        speakText(data.responseText);

        // Process immediate action routines
        handleBotAction(data.action, data.actionData);
      }
    } catch (err) {
      console.error("AI Communication error:", err);
      setMessages(prev => [...prev, { id: Date.now() + 2 + '', sender: 'bot', text: "Network connection lost. Please try again." }]);
    }
  };

  // Intercept special actions from bot
  const handleBotAction = (action, actionData) => {
    switch (action) {
      case 'speak-balance':
        if (actionData && textToSpeechEnabled) {
          speakText(`Your Savings Account available balance is ${actionData.savings} rupees.`);
        }
        break;
      case 'navigate-dashboard-analytics':
        setCurrentPage('dashboard');
        // Let component scroll down automatically
        setTimeout(() => {
          const el = document.getElementById('spending-breakdown-card');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
        break;
      case 'confirm-freeze-card':
        setCurrentPage('cards');
        setPendingAction('freeze');
        setFlowStep(1);
        break;
      case 'confirm-transfer-intent':
        setCurrentPage('payments');
        setPendingAction('transfer');
        setTransactionDetails(actionData);
        setFlowStep(1);
        if (setPrefilledPayment && actionData) {
          setPrefilledPayment({
            recipientName: actionData.recipientName || '',
            recipientAccount: actionData.recipientAccount || '',
            bankName: actionData.bank || '',
            amount: actionData.amount || ''
          });
        }
        break;
      case 'confirm-recharge-intent':
        setCurrentPage('dashboard');
        setPendingAction('recharge');
        setTransactionDetails(actionData);
        setFlowStep(1);
        break;
      case 'confirm-trade-stock':
        setCurrentPage('investments');
        if (setPrefilledInvestment && actionData) {
          setPrefilledInvestment({
            symbol: actionData.symbol || 'ZENITH',
            shares: actionData.shares || '',
            actionType: actionData.actionType || 'buy'
          });
        }
        break;
      case 'confirm-apply-loan':
        setCurrentPage('loans');
        if (setPrefilledLoan && actionData) {
          setPrefilledLoan({
            type: actionData.type || 'Personal Loan',
            amount: actionData.amount || 100000,
            tenureMonths: actionData.tenureMonths || 24
          });
        }
        break;
      case 'file-insurance-claim':
        setCurrentPage('insurance');
        if (setPrefilledClaim && actionData) {
          setPrefilledClaim({
            policyId: actionData.policyId || '1',
            claimAmount: actionData.claimAmount || '',
            details: actionData.details || ''
          });
        }
        break;
      case 'trigger-biometric-verification':
        if (triggerBiometrics && actionData) {
          const bType = actionData.type || 'face';
          triggerBiometrics(bType, (success) => {
            if (success) {
              fetch('/api/settings/biometrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  face: bType === 'face' ? true : undefined,
                  fingerprint: bType === 'fingerprint' ? true : undefined
                })
              }).then(res => {
                if (res.ok) {
                  addNotification("Biometrics Enabled", `${bType === 'face' ? 'Face ID' : 'Touch ID'} configured successfully.`);
                  setMessages(prev => [...prev, {
                    id: Date.now() + '',
                    sender: 'bot',
                    text: `${bType === 'face' ? 'Face ID' : 'Touch ID'} verification succeeded. Enabled biometric configurations.`
                  }]);
                  if (refreshAllData) refreshAllData();
                }
              });
            }
          });
        }
        break;
      case 'update-budget-limit':
        if (actionData?.category && actionData?.limit) {
          fetch('/api/settings/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: actionData.category,
              limit: actionData.limit
            })
          }).then(res => {
            if (res.ok) {
              addNotification("Budget Adjusted", `Set new limit of ₹${actionData.limit.toLocaleString('en-IN')} for ${actionData.category}.`);
              setMessages(prev => [...prev, {
                id: Date.now() + '',
                sender: 'bot',
                text: `Adjusted your monthly ${actionData.category} budget limit to ₹${actionData.limit.toLocaleString('en-IN')}.`
              }]);
              if (refreshAllData) refreshAllData();
            }
          });
        }
        break;
      case 'create-support-ticket':
        if (actionData?.subject && actionData?.category && actionData?.message) {
          fetch('/api/support/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: actionData.subject,
              category: actionData.category,
              message: actionData.message
            })
          }).then(res => {
            if (res.ok) {
              addNotification("Ticket Submitted", `Support ticket raised successfully.`);
              setMessages(prev => [...prev, {
                id: Date.now() + '',
                sender: 'bot',
                text: `I have raised a support ticket for you: "${actionData.subject}" (Category: ${actionData.category}).`
              }]);
              if (refreshAllData) refreshAllData();
            }
          });
        }
        break;
      case 'navigate-security-logs':
        setCurrentPage('settings');
        setTimeout(() => {
          const el = document.querySelector('.audit-logs-card');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.style.border = '2px solid var(--primary)';
            setTimeout(() => {
              el.style.border = '';
            }, 3000);
          }
        }, 800);
        break;
      case 'download-statement':
        triggerStatementPDF();
        break;
      case 'accessibility-update':
        if (actionData) {
          fetch('/api/settings/accessibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData)
          }).then(res => {
            if (res.ok) {
              addNotification("Accessibility Configured", "Updated style and accessibility variables.");
              if (refreshAllData) refreshAllData();
            }
          });
        }
        break;
      case 'toggle-travel-mode':
        setCurrentPage('cards');
        fetch('/api/cards/toggle-travel', { method: 'POST' })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const status = data.travelModeEnabled ? "Enabled" : "Disabled";
              addNotification("Travel Mode", `Travel Mode is now ${status}.`);
              setMessages(prev => [...prev, {
                id: Date.now() + '',
                sender: 'bot',
                text: `I have successfully updated your card settings. Travel Mode is now ${status}.`
              }]);
              if (refreshAllData) refreshAllData();
            }
          });
        break;
      case 'toggle-international-mode':
        setCurrentPage('cards');
        fetch('/api/cards/toggle-international', { method: 'POST' })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const status = data.internationalEnabled ? "Enabled" : "Disabled";
              addNotification("International Mode", `International payments are now ${status}.`);
              setMessages(prev => [...prev, {
                id: Date.now() + '',
                sender: 'bot',
                text: `I have successfully updated your card settings. International transaction capability is now ${status}.`
              }]);
              if (refreshAllData) refreshAllData();
            }
          });
        break;
      case 'report-card-fraud':
        setCurrentPage('cards');
        setPendingAction('fraud');
        setTransactionDetails(actionData);
        setFlowStep(1); // Prompt confirmation button in chat
        break;
      case 'cibil-inquiry':
        setCurrentPage('dashboard');
        setTimeout(() => {
          const el = document.querySelector('.view-report-link');
          el?.scrollIntoView({ behavior: 'smooth' });
          if (el) el.click(); // Trigger Bureau Report modal trigger
        }, 800);
        break;
      case 'financial-health-inquiry':
        setCurrentPage('dashboard');
        setTimeout(() => {
          const el = document.querySelector('.health-card-align');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
        break;
      default:
        break;
    }
  };

  // Handle choice button confirmation inside chat
  const handleButtonClick = (buttonText) => {
    const label = buttonText.toLowerCase();
    
    if (label.startsWith('add contact ')) {
      const name = buttonText.replace(/add contact /i, '').trim();
      setCurrentPage('payments');
      if (setPrefilledPayment) {
        setPrefilledPayment({ addContactName: name });
      }
      return;
    }

    if (label.includes('toggle travel mode')) {
      executeToggleTravelMode();
    } else if (label.includes('toggle international')) {
      executeToggleInternational();
    } else if (label.includes('report fraud')) {
      executeReportFraud();
    } else if (label.includes('confirm') || label.includes('block') || label.includes('order')) {
      if (pendingAction === 'freeze') {
        executeFreezeCard();
      } else if (pendingAction === 'fraud') {
        executeReportFraud();
      } else if (pendingAction === 'replace') {
        executeOrderReplacement();
      } else if (pendingAction === 'transfer' || pendingAction === 'recharge') {
        // Proceed to PIN gate
        setFlowStep(2);
        setFlowError('');
      } else if (label.includes('order')) {
        // Order replacement simulation
        executeOrderReplacement();
      }
    } else if (label.includes('reset') || label.includes('pin')) {
      executeResetPIN();
    } else {
      // Cancel
      setMessages(prev => [...prev, { id: Date.now() + '', sender: 'bot', text: "Operation cancelled." }]);
      resetTransactionFlow();
    }
  };

  // Perform Card Freeze API
  const executeFreezeCard = async () => {
    try {
      const response = await fetch('/api/cards/toggle-freeze', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        onCardAction(); // update Cards page state
        
        const feedback = result.frozen 
          ? "Your Credit Card ending 4567 has been Frozen instantly. I have loaded recent transaction checks for security." 
          : "Your card is unfrozen.";

        setMessages(prev => [...prev, { 
          id: Date.now() + '', 
          sender: 'bot', 
          text: feedback,
          buttons: result.frozen ? ["Order Replacement", "Reset PIN"] : [] 
        }]);
        
        speakText(feedback);
        addNotification("Card Frozen", "Suspended credit card via AI voice request.");
        resetTransactionFlow();
        setCurrentPage('cards');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeToggleTravelMode = async () => {
    try {
      const res = await fetch('/api/cards/toggle-travel', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const status = data.travelModeEnabled ? "Enabled" : "Disabled";
        addNotification("Travel Mode", `Travel Mode is now ${status}.`);
        setMessages(prev => [...prev, {
          id: Date.now() + '',
          sender: 'bot',
          text: `Travel Mode has been toggled to ${status} for card ending in 4567.`
        }]);
        if (refreshAllData) refreshAllData();
        resetTransactionFlow();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeToggleInternational = async () => {
    try {
      const res = await fetch('/api/cards/toggle-international', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const status = data.internationalEnabled ? "Enabled" : "Disabled";
        addNotification("International Mode", `International payments are now ${status}.`);
        setMessages(prev => [...prev, {
          id: Date.now() + '',
          sender: 'bot',
          text: `International transaction access has been toggled to ${status} for card ending in 4567.`
        }]);
        if (refreshAllData) refreshAllData();
        resetTransactionFlow();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeReportFraud = async () => {
    try {
      const response = await fetch('/api/cards/report-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: transactionDetails?.merchant || "Unrecognized Charge",
          amount: transactionDetails?.amount || 4500
        })
      });
      if (response.ok) {
        onCardAction(); // update Cards page state
        const feedback = "Zenith AI has successfully logged the fraud claim, blocked the transaction, and frozen your card ending in 4567. Would you like to request a new replacement card?";
        setMessages(prev => [...prev, {
          id: Date.now() + '',
          sender: 'bot',
          text: feedback,
          buttons: ["Order Replacement", "Cancel"]
        }]);
        speakText(feedback);
        addNotification("Fraud Locked Card", "Fraud warning logged. Suspended credit card.");
        setPendingAction('replace');
        setFlowStep(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform Replacement Card request
  const executeOrderReplacement = () => {
    addNotification("Replacement Ordered", "A new card has been requested. Courier tracking will be sent via SMS.");
    const feedback = "Replacement card request logged. It will be dispatched to Indiranagar address. Would you like to change your transaction PIN for additional safety?";
    setMessages(prev => [...prev, { id: Date.now() + '', sender: 'bot', text: feedback, buttons: ["Reset PIN", "Cancel"] }]);
    speakText(feedback);
    setPendingAction('reset-pin');
  };

  // Reset PIN flow simulation
  const executeResetPIN = () => {
    addNotification("PIN Code Changed", "Credit card security PIN reset successfully.");
    const feedback = "Your new 4-digit PIN is active. Remember to verify transactions with your new code.";
    setMessages(prev => [...prev, { id: Date.now() + '', sender: 'bot', text: feedback }]);
    speakText(feedback);
    resetTransactionFlow();
  };

  // Verify PIN in transaction flow
  const handleVerifyPIN = () => {
    if (pinValue === '1234') {
      setFlowStep(3); // Go to OTP
      setFlowError('');
    } else {
      setFlowError("Incorrect transaction PIN. Try 1234.");
    }
  };

  // Verify OTP and complete transaction
  const handleVerifyOTP = async () => {
    if (otpValue !== '123456') {
      setFlowError("Incorrect OTP code. Try demo code 123456.");
      return;
    }

    setFlowStep(10); // Loading status
    setFlowError('');

    try {
      if (pendingAction === 'transfer') {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: transactionDetails.recipientName,
            recipientAccount: transactionDetails.recipientAccount,
            amount: transactionDetails.amount,
            category: 'Others',
            remark: 'AI Assistant payment',
            pin: pinValue
          })
        });

        if (response.ok) {
          const result = await response.json();
          addNotification("Transfer Successful", `Sent ₹${transactionDetails.amount} to ${transactionDetails.recipientName}`);
          
          setMessages(prev => [...prev, { 
            id: Date.now() + '', 
            sender: 'bot', 
            text: `Transaction Complete! Successfully transferred ₹${transactionDetails.amount} to ${transactionDetails.recipientName}. Receipt ID: ${result.transaction.id}.` 
          }]);
          
          if (refreshAllData) refreshAllData();
          resetTransactionFlow();
        } else {
          const err = await response.json();
          setFlowError(err.error || "Transfer failed.");
          setFlowStep(2); // kick back to PIN
        }
      } else if (pendingAction === 'recharge') {
        const response = await fetch('/api/payments/pay-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billId: 2 }) // Mobile Bill simulation
        });

        if (response.ok) {
          addNotification("Recharge Complete", `Jio Mobile recharged for ₹${transactionDetails.amount}`);
          setMessages(prev => [...prev, { id: Date.now() + '', sender: 'bot', text: `Jio Prepaid recharged successfully for ₹${transactionDetails.amount}.` }]);
          if (refreshAllData) refreshAllData();
          resetTransactionFlow();
        } else {
          setFlowError("Billing system error.");
          setFlowStep(2);
        }
      }
    } catch (err) {
      console.error(err);
      setFlowError("Core connection failure.");
      setFlowStep(2);
    }
  };

  // Mock PDF generator
  const triggerStatementPDF = () => {
    addNotification("Statement Generated", "Downloading PDF Digi Statement...");
    
    // Create hidden link to download a mock summary csv/pdf text file
    const element = document.createElement("a");
    const file = new Blob([
      `ZENITH SECURE BANKING - DIGI SUMMARY STATEMENT\n`,
      `User Name: ${user?.name || "Kavya Nair"}\n`,
      `Account: Savings ending in 1098\n`,
      `Statement Date: June 2026\n`,
      `-----------------------------------------------------\n`,
      `Total Spend: INR 42,500\n`,
      `Food & Dining (28%): INR 11,900\n`,
      `Housing & Rent (43%): INR 18,430\n`,
      `Shopping (18%): INR 7,650\n`,
      `Others: INR 4,520\n`,
      `-----------------------------------------------------\n`,
      `Thank you for banking securely with Zenith AI.`
    ], {type: 'text/plain'});
    
    element.href = URL.createObjectURL(file);
    element.download = "Zenith_Digi_Statement_June_2026.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    resetTransactionFlow();
  };

  const resetTransactionFlow = () => {
    setPendingAction(null);
    setFlowStep(0);
    setPinValue('');
    setOtpValue('');
    setFlowError('');
    setTransactionDetails(null);
  };

  return (
    <div className={`ai-assistant-wrapper ${isOpen ? 'active' : ''}`}>
      {/* Floating Glowing Orb Button */}
      <button 
        className={`ai-orb-button ${isListening ? 'listening' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Zenith AI Assistant"
      >
        <div className="orb-inner">
          <span className="orb-sparkle">✨</span>
          <span className="orb-icon">🤖</span>
        </div>
        {isListening && <div className="listening-pulse-ring"></div>}
      </button>

      {/* Main Conversation Drawer Panel */}
      {isOpen && (
        <div className="ai-chat-drawer">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-status-dot"></span>
              <div>
                <h4>Zenith AI Assistant</h4>
                <p>Online & Secure</p>
              </div>
            </div>
            <div className="ai-chat-controls">
              {/* Voice Readback Toggle */}
              <button 
                className={`btn-tts-toggle ${textToSpeechEnabled ? 'active' : ''}`}
                onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                title={textToSpeechEnabled ? "Mute Voice Outputs" : "Unmute Voice Outputs"}
              >
                {textToSpeechEnabled ? '🔊' : '🔇'}
              </button>
              {/* Close Button */}
              <button className="btn-close-chat" onClick={() => setIsOpen(false)}>×</button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-container ${msg.sender}`}>
                {msg.sender === 'bot' && <div className="bot-avatar-badge">Z</div>}
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  
                  {/* Financial calculator result table */}
                  {msg.action === 'calculate-finance' && msg.actionData && (
                    <div className="financial-calc-result-table mt-2" style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Principal</td>
                            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{msg.actionData.principal?.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Rate of Interest</td>
                            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{msg.actionData.rate}% p.a.</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Term (Months)</td>
                            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold' }}>{msg.actionData.term}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 0 0 0', color: 'var(--primary)', fontWeight: 'semibold' }}>
                              {msg.actionData.formula === 'emi' ? 'Monthly EMI' : 'Total Interest'}
                            </td>
                            <td style={{ padding: '6px 0 0 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>
                              {msg.actionData.resultText}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Inline interactive buttons from NLU response */}
                  {msg.buttons && msg.buttons.length > 0 && flowStep <= 1 && (
                    <div className="chat-button-row mt-2">
                      {msg.buttons.map((btnText, idx) => (
                        <button 
                          key={idx} 
                          className={`btn ${idx === 0 ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => handleButtonClick(btnText)}
                        >
                          {btnText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Interactive PIN / OTP gate inside chat */}
            {flowStep > 1 && (
              <div className="chat-bubble-container bot">
                <div className="bot-avatar-badge">Z</div>
                <div className="chat-bubble secure-card">
                  <h5 className="secure-title">🔒 Zenith Gateway Authorization</h5>
                  
                  {flowError && <p className="secure-error mt-1">{flowError}</p>}
                  
                  {/* PIN Input step */}
                  {flowStep === 2 && (
                    <div className="form-group mt-2">
                      <input 
                        type="password" 
                        maxLength="4" 
                        placeholder={t.pinPlaceholder}
                        className="form-control text-center"
                        style={{ letterSpacing: '6px', fontSize: '18px' }}
                        value={pinValue}
                        onChange={(e) => setPinValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyPIN()}
                      />
                      <div className="chat-button-row mt-2">
                        <button className="btn btn-primary" onClick={handleVerifyPIN}>{t.submit}</button>
                        <button className="btn btn-outline" onClick={resetTransactionFlow}>{t.cancel}</button>
                      </div>
                    </div>
                  )}

                  {/* OTP Input step */}
                  {flowStep === 3 && (
                    <div className="form-group mt-2">
                      <p className="secure-hint">SMS OTP sent to registered number. Enter demo code `123456`.</p>
                      <input 
                        type="text" 
                        maxLength="6" 
                        placeholder={t.otpPlaceholder}
                        className="form-control text-center"
                        style={{ letterSpacing: '4px', fontSize: '18px' }}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                      />
                      <div className="chat-button-row mt-2">
                        <button className="btn btn-primary" onClick={handleVerifyOTP}>{t.submit}</button>
                        <button className="btn btn-outline" onClick={resetTransactionFlow}>{t.cancel}</button>
                      </div>
                    </div>
                  )}

                  {/* Processing Status */}
                  {flowStep === 10 && (
                    <div className="text-center py-2">
                      <div className="spinner-sm"></div>
                      <p className="mt-1" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.processing}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions Chips */}
          <div className="ai-chat-suggestions">
            <button className="chip" onClick={() => handleSendMessage(t.askBalance)}>{t.askBalance}</button>
            <button className="chip" onClick={() => handleSendMessage(t.lockCard)}>{t.lockCard}</button>
            <button className="chip" onClick={() => handleSendMessage(t.showExpenses)}>{t.showExpenses}</button>
            <button className="chip" onClick={() => handleSendMessage(t.rechargeJio)}>{t.rechargeJio}</button>
            <button className="chip" onClick={() => handleSendMessage(t.downloadStatement)}>{t.downloadStatement}</button>
          </div>

          {/* Bottom input area */}
          <div className="ai-chat-input-bar">
            {/* Speech Mic Button */}
            <button 
              className={`btn-mic ${isListening ? 'listening' : ''}`}
              onClick={handleMicClick}
              title="Voice Input Command"
            >
              🎤
            </button>
            
            {/* Input field */}
            <input 
              type="text" 
              placeholder={isListening ? t.listening : "Ask Zenith AI..."} 
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isListening}
            />

            {/* Send Button */}
            <button className="btn-send" onClick={() => handleSendMessage()}>
              ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
