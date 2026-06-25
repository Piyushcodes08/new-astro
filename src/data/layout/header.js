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
            path: '#',
            subLinks: [
                { name: 'Bracelets', path: '/products?category=bracelets', desc: 'Consecrated Pyrite, Chakra, Jade, and Quartz bracelets.' },
                { name: 'Rings', path: '/products?category=rings', desc: 'Healing rings for protection, success, and prosperity.' },
                { name: 'Malas', path: '/products?category=malas', desc: 'Sacred Rudraksha and crystal malas for meditation.' },
                { name: 'All Products', path: '/products', desc: 'Browse our complete catalog of spiritual and sacred items.' }
            ]
        },
        { name: 'Contact', path: '/contact' }
    ],
    cta: {
        text: 'Appointment',
        path: '/appointment'
    }
};
