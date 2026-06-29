export const headerData = {
    navLinks: [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { 
            name: 'Services', 
            path: '#',
            subLinks: [
                { name: 'Courses', path: '/courses', desc: 'Learn Vedic Astrology, Bhagavad Gita, and Vedic sciences.' },
                { name: 'Consulting', path: '/consulting', desc: 'Personalized guidance, horoscope readings, and remedies.' },
                { name: 'Articles', path: '/articles', desc: 'Explore deep spiritual knowledge, research, and cosmic insights.' }
            ]
        },
        {
            name: 'Products',
            path: '/products',
        },
        { name: 'Contact', path: '/contact' }
    ],
    cta: {
        text: 'Appointment',
        path: '/appointment'
    }
};
