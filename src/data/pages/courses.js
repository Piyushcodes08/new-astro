import narad from '../../assets/images/pages/courses/narad.webp';
import geeta from '../../assets/images/pages/courses/geeta.webp';
import foundation from '../../assets/images/pages/courses/foundation.webp';
import foundation640 from '../../assets/images/pages/courses/foundation-640.webp';
import foundation960 from '../../assets/images/pages/courses/foundation-960.webp';
import foundation1440 from '../../assets/images/pages/courses/foundation-1440.webp';
import foundation640Avif from '../../assets/images/pages/courses/foundation-640.avif';
import foundation960Avif from '../../assets/images/pages/courses/foundation-960.avif';
import foundation1440Avif from '../../assets/images/pages/courses/foundation-1440.avif';
import Aboutus from '../../assets/images/pages/about/Aboutus-pg.webp';
import Aboutus640 from '../../assets/images/pages/about/Aboutus-pg-640.webp';
import Aboutus960 from '../../assets/images/pages/about/Aboutus-pg-960.webp';
import Aboutus1440 from '../../assets/images/pages/about/Aboutus-pg-1440.webp';
import Aboutus640Avif from '../../assets/images/pages/about/Aboutus-pg-640.avif';
import Aboutus960Avif from '../../assets/images/pages/about/Aboutus-pg-960.avif';
import Aboutus1440Avif from '../../assets/images/pages/about/Aboutus-pg-1440.avif';
import self from '../../assets/images/pages/courses/basics.webp';

export const coursesData = [
  {
    id: 1,
    title: "Basics of Astrology",
    description: "Astrology is the study of how the positions and movements of celestial bodies are believed to influence human life and events.",
    bgImage: self,
    thumbImage: self,
    buttonText: "Details"
  },
  {
    id: 2,
    title: "Narad Puran",
    description: "Narada Purana is a sacred text focused on devotion, rituals, and spiritual wisdom.",
    bgImage: narad,
    thumbImage: narad,
    buttonText: "Details"
  },
  {
    id: 3,
    title: "New edge Bhagwat Geeta",
    description: "Bhagavad Gita is a 700-verse Hindu scripture that is part of the epic Mahabharata, offering profound insights into duty, righteousness, and the path to spiritual liberation.",
    bgImage: geeta,
    thumbImage: geeta,
    buttonText: "Details"
  },
  {
    id: 4,
    title: "Foundation of Vedic Astrology",
    description: "Vedic astrology, also known as Jyotish, is a traditional Hindu system of astrology that uses the positions of celestial bodies to interpret and predict life events.",
    bgImage: foundation,
    bgImageSet: {
      avif: `${foundation640Avif} 640w, ${foundation960Avif} 960w, ${foundation1440Avif} 1440w`,
      webp: `${foundation640} 640w, ${foundation960} 960w, ${foundation1440} 1440w`
    },
    thumbImage: foundation,
    buttonText: "Details"
  },
  {
    id: 5,
    title: "The Essentials of Self-Discovery",
    description: "The Essentials of Self-Discovery (Panchang & Basic Astrology) is a simple guide to understanding yourself through time, planets, and cosmic patterns.",
    bgImage: Aboutus,
    bgImageSet: {
      avif: `${Aboutus640Avif} 640w, ${Aboutus960Avif} 960w, ${Aboutus1440Avif} 1440w`,
      webp: `${Aboutus640} 640w, ${Aboutus960} 960w, ${Aboutus1440} 1440w`
    },
    thumbImage: Aboutus,
    buttonText: "Details"
  }
];
