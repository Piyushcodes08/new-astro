import ariesIcon from '../../assets/images/sections/horoscope/aries (1).webp';
import taurusIcon from '../../assets/images/sections/horoscope/taurus (1).webp';
import geminiIcon from '../../assets/images/sections/horoscope/gemini (1).webp';
import cancerIcon from '../../assets/images/sections/horoscope/cancer.webp';
import leoIcon from '../../assets/images/sections/horoscope/leo (1).webp';
import virgoIcon from '../../assets/images/sections/horoscope/virgo (1).webp';
import libraIcon from '../../assets/images/sections/horoscope/libra (1).webp';
import scorpioIcon from '../../assets/images/sections/horoscope/scorpio (1).webp';
import sagittariusIcon from '../../assets/images/sections/horoscope/sagittarius.webp';
import capricornIcon from '../../assets/images/sections/horoscope/capricorn (1).webp';
import aquariusIcon from '../../assets/images/sections/horoscope/aquarius.webp';
import piscesIcon from '../../assets/images/sections/horoscope/pisces (1).webp';

export const horoscopeData = [
  {
    name: "Aries",
    icon: ariesIcon,
    element: "Fire",
    traits: "Bold, energetic, fearless",
    description: "Aries is the pioneer of the zodiac, driven by passion, courage, and a relentless desire to lead. People born under Aries are natural initiators who thrive in fast-paced environments and love taking on new challenges. Their fiery energy makes them confident, competitive, and action-oriented."
  },
  {
    name: "Taurus",
    icon: taurusIcon,
    element: "Earth",
    traits: "Stable, loyal, sensual",
    description: "Taurus represents stability, comfort, and grounded energy. These individuals value security, loyalty, and the pleasures of life, often surrounding themselves with beauty and luxury. Known for their patience and persistence, Taurus people are reliable in all relationships."
  },
  {
    name: "Gemini",
    icon: geminiIcon,
    element: "Air",
    traits: "Curious, adaptable, witty",
    description: "Gemini is the communicator of the zodiac, full of curiosity and intellectual energy. These individuals are highly adaptable, quick thinkers, and love engaging in conversations. Their dual nature allows them to see multiple perspectives, making them versatile."
  },
  {
    name: "Cancer",
    icon: cancerIcon,
    element: "Water",
    traits: "Emotional, protective, intuitive",
    description: "Cancer is deeply connected to emotions, family, and home. These individuals are nurturing, compassionately, and highly intuitive, often sensing the feelings of others without words. They value emotional security and form strong bonds with loved ones."
  },
  {
    name: "Leo",
    icon: leoIcon,
    element: "Fire",
    traits: "Confident, charismatic, bold",
    description: "Leo is the natural leader and performer of the zodiac, radiating confidence, warmth, and charisma. These individuals love being in the spotlight and have a strong desire to express themselves creatively. They are generous, passionate, and fiercely loyal."
  },
  {
    name: "Virgo",
    icon: virgoIcon,
    element: "Earth",
    traits: "Analytical, practical, perfectionist",
    description: "Virgo is detail-oriented, thoughtful, and highly analytical. These individuals strive for perfection and take pride in their ability to organize, improve, and refine everything. They are practical problem-solvers who approach life with logic and precision."
  },
  {
    name: "Libra",
    icon: libraIcon,
    element: "Air",
    traits: "Balanced, charming, diplomatic",
    description: "Libra seeks harmony, balance, and beauty in all aspects of life. These individuals are naturally charming, social, and skilled at maintaining peace. They value fairness and often act as mediators, bringing people together with their diplomatic nature."
  },
  {
    name: "Scorpio",
    icon: scorpioIcon,
    element: "Water",
    traits: "Intense, mysterious, powerful",
    description: "Scorpio is known for its depth, intensity, and magnetic presence. These individuals are highly passionate and emotionally powerful, often experiencing life on a profound level. They are determined, strategic, and unafraid of transformation."
  },
  {
    name: "Sagittarius",
    icon: sagittariusIcon,
    element: "Fire",
    traits: "Adventurous, optimistic, free-spirited",
    description: "Sagittarius is the explorer of the zodiac, always seeking knowledge, truth, and new experiences. These individuals are optimistic and driven by a love for freedom. They enjoy exploring different cultures, ideas, and philosophies."
  },
  {
    name: "Capricorn",
    icon: capricornIcon,
    element: "Earth",
    traits: "Disciplined, ambitious, responsible",
    description: "Capricorn is focused, disciplined, and goal-oriented. These individuals are driven by ambition and have a strong sense of responsibility. They are excellent planners who value structure, hard work, and long-term success."
  },
  {
    name: "Aquarius",
    icon: aquariusIcon,
    element: "Air",
    traits: "Innovative, independent, visionary",
    description: "Aquarius is forward-thinking, unique, and highly independent. These individuals are visionaries who enjoy challenging norms and bringing new ideas. They value individuality and often think outside the box."
  },
  {
    name: "Pisces",
    icon: piscesIcon,
    element: "Water",
    traits: "Dreamy, compassionate, artistic",
    description: "Pisces is deeply intuitive, emotional, and imaginative. These individuals are compassionate souls who connect easily with others on an emotional level. They are often drawn to art, creativity, and spirituality."
  }
];

export const RASHIPHAL_SUMMARIES = {
  Aries: {
    hi: "आज का दिन आपके लिए ऊर्जा और उत्साह से भरा रहेगा। नए कार्यों की शुरुआत करने के लिए यह समय अनुकूल है। आत्मविश्वास के साथ आगे बढ़ेंगे तो सफलता निश्चित है।",
    en: "Today is filled with energy and enthusiasm for you. This is a favorable time to start new endeavors. Success is certain if you move forward with confidence."
  },
  Taurus: {
    hi: "धैर्य और स्थिरता के साथ अपने लक्ष्यों की ओर बढ़ें। आर्थिक मामलों में सावधानी बरतें। परिवार के साथ समय बिताने से मानसिक शांति मिलेगी।",
    en: "Move towards your goals with patience and stability. Be cautious in financial matters. Spending time with family will bring mental peace."
  },
  Gemini: {
    hi: "आपकी वाणी और विचार आज विशेष रूप से प्रभावशाली रहेंगे। नए लोगों से मुलाकात हो सकती है। किसी भी निर्णय को लेने से पहले अच्छी तरह सोच-विचार करें।",
    en: "Your speech and thoughts will be particularly influential today. You may meet new people. Think carefully before making any decisions."
  },
  Cancer: {
    hi: "भावनात्मक रूप से संवेदनशील रहेंगे। परिवार में सुख-शांति बनी रहेगी। किसी पुराने मित्र से मुलाकात हो सकती है। स्वास्थ्य का ध्यान रखें।",
    en: "You will be emotionally sensitive. Peace and harmony will prevail in the family. You may meet an old friend. Take care of your health."
  },
  Leo: {
    hi: "आज आपका आत्मविश्वास चरम पर रहेगा। नेतृत्व क्षमता का प्रदर्शन करने का समय है। करियर में उन्नति के योग हैं। संयम बनाए रखें।",
    en: "Your confidence will be at its peak today. It's time to demonstrate your leadership skills. Career advancement is indicated. Maintain your composure."
  },
  Virgo: {
    hi: "आपकी सूझबूझ और विश्लेषण क्षमता आज काम आएगी। कार्यक्षेत्र में सफलता मिलेगी। स्वास्थ्य संबंधी मामलों पर ध्यान दें। दिनचर्या में अनुशासन बनाए रखें।",
    en: "Your wisdom and analytical skills will come in handy today. Success awaits in the workplace. Pay attention to health matters. Maintain discipline in your routine."
  },
  Libra: {
    hi: "संतुलन और सामंजस्य बनाए रखें। रिश्तों में मधुरता आएगी। कला और सौंदर्य के प्रति आपकी रुचि बढ़ेगी। महत्वपूर्ण निर्णय टालने से बचें।",
    en: "Maintain balance and harmony. Sweetness will come in relationships. Your interest in art and beauty will increase. Avoid postponing important decisions."
  },
  Scorpio: {
    hi: "गहन ऊर्जा और दृढ़ संकल्प के साथ कार्य करें। आर्थिक लाभ के योग हैं। किसी रहस्य का पता चल सकता है। आत्मनिरीक्षण का समय है।",
    en: "Work with intense energy and determination. Financial gains are indicated. A mystery may be revealed. It's time for self-introspection."
  },
  Sagittarius: {
    hi: "साहस और आशावाद के साथ नए अवसरों को अपनाएं। यात्रा के योग हैं। ज्ञान वृद्धि के लिए यह समय उपयुक्त है। दूसरों की मदद करने से संतोष मिलेगा।",
    en: "Embrace new opportunities with courage and optimism. Travel is indicated. This time is suitable for knowledge enhancement. Helping others will bring satisfaction."
  },
  Capricorn: {
    hi: "अनुशासन और मेहनत से सफलता प्राप्त होगी। पेशेवर जीवन में उन्नति के अवसर मिलेंगे। पुराने लक्ष्यों को पूरा करने का समय है। परिवार का सहयोग मिलेगा।",
    en: "Success will be achieved through discipline and hard work. Opportunities for advancement in professional life will arise. It's time to accomplish old goals. Family support will be there."
  },
  Aquarius: {
    hi: "नवीन विचार और नवाचार आपको आगे बढ़ाएंगे। सामाजिक दायरा बढ़ेगा। मित्रों के साथ समय बिताने से प्रसन्नता मिलेगी। किसी नई योजना पर काम कर सकते हैं।",
    en: "Innovative ideas and creativity will propel you forward. Your social circle will expand. Spending time with friends will bring joy. You can work on a new plan."
  },
  Pisces: {
    hi: "आपकी संवेदनशीलता और कल्पनाशीलता आज चरम पर होगी। आध्यात्मिक गतिविधियों में रुचि बढ़ेगी। कला और संगीत का आनंद लें। सहज ज्ञान पर भरोसा करें।",
    en: "Your sensitivity and imagination will be at their peak today. Interest in spiritual activities will increase. Enjoy art and music. Trust your intuition."
  }
};

