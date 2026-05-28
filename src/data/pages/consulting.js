import consultingHero from '../../assets/images/pages/consulting/consulting.webp';
import personalizedImg from '../../assets/images/pages/consulting/personalized-guidance.webp';
import lifePathImg from '../../assets/images/pages/consulting/life-path.webp';
import careerImg from '../../assets/images/pages/consulting/career-success.webp';
import relationshipImg from '../../assets/images/pages/consulting/relationship-compatibility.webp';
import remedialImg from '../../assets/images/pages/consulting/remedial-astrology.webp';
import supportImg from '../../assets/images/pages/consulting/ongoing-support.webp';

export const consultingData = {
    hero: {
        pill: "Cosmic Consulting",
        title: "Empower Your Life with",
        titleHighlight: "Vahlay Astro",
        subtitle: "Personalized guidance tailored to your unique birth chart. Experience deep insights that light your path toward success and harmony.",
        buttonText: "Book Session",
        secondaryButtonText: "Explore More",
        heroImage: consultingHero
    },
    stats: [
        { num: '5000+', label: 'Consultations' },
        { num: '98%', label: 'Satisfaction' },
        { num: '10+', label: 'Years Exp' },
        { num: '50+', label: 'Service Types' },
    ],
    services: {
        title: "Professional",
        titleHighlight: "Solutions",
        description: "We provide a comprehensive range of cosmic consultations to help you unlock deeper insights into your personality, destiny, and life purpose.",
        items: [
            {
                title: 'Personalized Astrological Guidance',
                description: 'Dive deep into your unique astrological chart for clarity on relationships, career, and personal growth.',
                img: personalizedImg,
                icon: '⭐',
                tag: 'Popular'
            },
            {
                title: 'Life Path & Destiny Consultation',
                description: "Unlock your life's purpose, navigate challenges, and seize opportunities by exploring your unique astrological blueprint.",
                img: lifePathImg,
                icon: '🌙',
                tag: 'Deep Insights'
            },
            {
                title: 'Career & Success Consultation',
                description: 'Identify your ideal career path, unlock potential, and align your work with the strengths in your astrological chart.',
                img: careerImg,
                icon: '🚀',
                tag: 'Top Rated'
            },
            {
                title: 'Relationship Compatibility Reading',
                description: 'Understand the dynamics of your relationships and find ways to foster deeper connections and mutual understanding.',
                img: relationshipImg,
                icon: '❤️',
                tag: 'Essential'
            },
            {
                title: 'Remedial Astrology Consultation',
                description: 'Discover effective remedies and rituals to overcome obstacles and enhance positive energy in your life.',
                img: remedialImg,
                icon: '🛡️',
                tag: 'Recommended'
            },
            {
                title: 'Ongoing Support and Guidance',
                description: 'Stay aligned with cosmic rhythms and receive continuous support to navigate life’s journey with confidence.',
                img: supportImg,
                icon: '♾️',
                tag: 'Holistic'
            },
        ]
    },
    process: {
        title: "How It",
        titleHighlight: "Works",
        subtitle: "Simple steps to unlock your cosmic potential.",
        steps: [
            { step: '01', title: 'Schedule', desc: 'Book your session online through our simple calendar system.', iconType: 'calendar' },
            { step: '02', title: 'Connect', desc: 'Receive a personalized session with our expert astrologers.', iconType: 'user' },
            { step: '03', title: 'Insights', desc: 'Get deep clarity and actionable steps for your life journey.', iconType: 'clock' },
            { step: '04', title: 'Evolution', desc: 'Implement changes and witness your transformation unfold.', iconType: 'rocket' },
        ]
    },
    testimonials: {
        title: "Client",
        titleHighlight: "Experiences",
        subtitle: "Transformative stories from those who walked the path."
    },
    highlights: {
        title: "Master Your",
        titleHighlight: "Destiny",
        subtitle: "Your birth chart is a blueprint for success. Let us help you decode the secrets of the stars.",
        buttonText: "Schedule Now"
    },
    cta: {
        title: "Ready to Start Your",
        titleHighlight: "Transformation?",
        subtitle: "Take the first step toward a more aligned and purposeful life. Our experts are here to guide you.",
        primaryButtonText: "Book Your Session",
        secondaryButtonText: "Contact Us"
    }
};
