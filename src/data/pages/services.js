import foundationImg from '../../assets/images/pages/courses/foundation.webp';
import selfImg from '../../assets/images/pages/courses/self.webp';
import about1 from '../../assets/images/pages/about/about-1.webp';
import about2 from '../../assets/images/pages/about/about-2.webp';
import about3 from '../../assets/images/pages/about/about-3.webp';
import about4 from '../../assets/images/pages/about/about-4.webp';
import coursesPortalImg from '../../assets/images/pages/courses/courses.webp';
import consultingPortalImg from '../../assets/images/pages/consulting/consulting.webp';
import articlesPortalImg from '../../assets/images/pages/blogs/books.webp';

export const servicesData = {
    hero: {
        pill: "Our Sacred Services",
        title: "Premium",
        titleHighlight: "Astrological",
        titleSuffix: "Guidance",
        subtitle: "Personalized astrological guidance, spiritual counseling, and cosmic remedies tailored for your life's journey toward prosperity and enlightenment.",
        primaryButtonText: "Book Session",
        secondaryButtonText: "Explore More"
    },
    offerings: {
        title: "Explore Our",
        titleHighlight: "Offerings",
        subtitle: "We provide a comprehensive range of cosmic sciences to help you unlock deeper insights into your personality, destiny, and life purpose.",
        items: [
            {
                title: "Personalized Guidance",
                desc: "Deep astrological analysis for clarity on relationships, career, and personal growth.",
                img: foundationImg
            },
            {
                title: "Destiny Consultation",
                desc: "Navigate life's challenges and seize cosmic opportunities via your unique blueprint.",
                img: selfImg
            },
            {
                title: "Career & Success",
                desc: "Identify your ideal path and align your professional work with planetary strengths.",
                img: about1
            },
            {
                title: "Relationship Compatibility",
                desc: "Analyze connection dynamics for better communication and spiritual harmony.",
                img: about2
            },
            {
                title: "Remedial Astrology",
                desc: "Address planetary imbalances with proven Vedic remedies tailored to your chart.",
                img: about3
            },
            {
                title: "Ongoing Support",
                desc: "Stay aligned with personalized follow-ups and continuous spiritual guidance.",
                img: about4
            }
        ]
    },
    portals: {
        title: "Our Main",
        titleHighlight: "Portals",
        items: [
            { title: "Courses", img: coursesPortalImg, link: "/courses", desc: "Learn the secrets of the cosmos." },
            { title: "Consultation", img: consultingPortalImg, link: "/contact", desc: "Get personalized expert guidance." },
            { title: "Articles", img: articlesPortalImg, link: "/articles", desc: "Read profound spiritual wisdom." }
        ]
    },
    cta: {
        title: "Ready to Begin Your",
        titleHighlight: "Transformation?",
        subtitle: "Book a one-on-one session with our expert astrologers and transform your life today.",
        buttonText: "Schedule Now"
    }
};
