import aboutuspg from '../../assets/images/pages/about/Aboutus-pg.webp';
import about1 from '../../assets/images/pages/about/about-1.webp';
import about2 from '../../assets/images/pages/about/about-2.webp';
import about3 from '../../assets/images/pages/about/about-3.webp';
import about4 from '../../assets/images/pages/about/about-4.webp';

export const aboutData = {
    hero: {
        pill: "Our Journey & Mission",
        title: "Welcome to",
        titleHighlight: "Vahlay Astro",
        subtitle: "Discover the celestial wisdom that guides your path to success, harmony, and spiritual enlightenment."
    },
    whoWeAre: {
        title: "Who We Are",
        description: "At Vahlay Astro, we blend ancient Vedic astrology with modern spiritual insights to guide individuals and businesses through life’s most important journeys.",
        philosophyTitle: "Our Philosophy",
        philosophyDescription: "We empower our clients with personalized cosmic guidance that provides clarity in relationships, career, prosperity, and life purpose.",
        image: aboutuspg
    },
    services: {
        title: "Our",
        titleHighlight: "Cosmic",
        titleSuffix: "Services",
        items: [
            {
                title: "Courses",
                desc: "Learn astrology deeply and master cosmic sciences.",
                link: "/courses"
            },
            {
                title: "Consultation",
                desc: "Personalized guidance for major life decisions.",
                link: "/consulting"
            },
            {
                title: "Articles",
                desc: "Discover profound astrological knowledge.",
                link: "/articles"
            },
        ]
    },
    ambition: {
        items: [
            {
                title: "Our Ambition",
                desc: "To empower individuals to live with awareness, harmony, and purpose by unlocking the timeless wisdom of astrology.",
            },
            {
                title: "Our Vision",
                desc: "To become a trusted spiritual and astrological partner for people seeking clarity, transformation, and cosmic alignment.",
            },
        ]
    },
    values: {
        title: "Core",
        titleHighlight: "Values",
        items: [
            { title: "Integrity", desc: "Transparency and honesty in all guidance.", iconType: "shield" },
            { title: "Empathy", desc: "Deep understanding of every client’s journey.", iconType: "heart" },
            { title: "Innovation", desc: "Modernizing ancient cosmic wisdom.", iconType: "lightbulb" },
            { title: "Excellence", desc: "Delivering premium spiritual experiences.", iconType: "trophy" },
        ]
    },
    cta: {
        title: "Ready to Align with the Stars?",
        subtitle: "Let Vahlay Astro guide you toward clarity, abundance, and spiritual harmony.",
        buttonText: "Explore Services"
    },
    // From legacy aboutData.js
    sectionData: {
        title: "About US",
        images: [
            { src: about1, alt: "About Vahlay Astro 1" },
            { src: about2, alt: "About Vahlay Astro 2" },
            { src: about3, alt: "About Vahlay Astro 3" },
            { src: about4, alt: "About Vahlay Astro 4" },
        ],
        paragraphs: [
            "Vahlay Astro was founded with the mission to bring the ancient wisdom of astrology into the modern world. Our experienced astrologers guide individuals and businesses through life’s most significant decisions, helping them connect deeply with the universe and understand the cycles of nature.",
            "We believe astrology empowers individuals by providing clarity and insight. Rooted in Vedic astrology, our approach is designed to meet the needs of today’s world, offering personalized support for personal growth and professional success."
        ],
        buttonText: "Read More"
    }
};
