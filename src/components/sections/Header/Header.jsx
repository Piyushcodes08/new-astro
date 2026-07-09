import logo from "../../../assets/images/common/logos/vahlay_astro logo.webp";
import { auth, db } from '../../../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { headerData } from '../../../data/layout/header';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('Header');

const Header = () => {
    const { navLinks } = headerData;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);
    const location = useLocation();

    // Check if we are on admin or dashboard-related pages to keep header always visible/blurred
    const portalPaths = ['/dashboard', '/profile', '/enrolledcourse', '/admin', '/finalize', '/studentlivesession', '/payemi', '/notifications'];

    // We treat as portal if it's in portalPaths OR if it's a specific learning course page (but NOT the main course catalog)
    const isPortal = portalPaths.some(path => location.pathname.startsWith(path)) ||
        (location.pathname.startsWith('/course/') && !location.pathname.startsWith('/courses'));

    const showBg = scrolled || isPortal;

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollTop =
                window.scrollY ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                (e.target && e.target.scrollTop) ||
                0;

            setScrolled(scrollTop > 20);
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    // Body Scroll Lock for Mobile Menu
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset mobile submenu state when main menu closes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!isOpen) {
            setActiveMobileSubmenu(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const q = query(collection(db, "users"), where("email", "==", currentUser.email));
                    const querySnapshot = await getDocs(q);
                    let adminStatus = false;
                    querySnapshot.forEach((doc) => {
                        if (doc.data().isAdmin) {
                            adminStatus = true;
                        }
                    });
                    setIsAdmin(adminStatus);
                } catch (error) {
                    logger.error("Error checking admin status:", error);
                }
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            logger.error("Logout failed", error);
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-2000 w-full h-auto text-white transition-all duration-700 ${showBg && !isOpen
                ? "border-b border-white/5 backdrop-blur-[15px] bg-[#0f0404]/90"
                : "bg-transparent"
                }`}
        >
            {/* Premium Custom Glowing Background */}
            <div
                className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 overflow-hidden ${showBg && !isOpen ? "opacity-[0.75]" : "opacity-0"
                    }`}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(145deg, #bf0603 30%, #b0a102 70%)",
                        filter: "blur(100px)",
                        transform: "scale(1.2)",
                    }}
                />
            </div>

            <nav className="mx-auto grid items-center transition-all duration-500 max-w-container-max-width px-3.75 md:px-12.5 py-0 h-full w-full"
                style={{ gridTemplateColumns: 'auto 1fr auto' }}
            >
                    {/* Col 1 — Logo (Left) */}
                    <div className={`flex items-center h-full transition-all duration-500 py-2 ${isOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <Link to="/" className="flex items-center" aria-label="Vahlay Astro Home">
                            <img
                                src={logo}
                                alt="Vahlay Astro Logo"
                                loading="lazy"
                                className={`transition-all duration-500 object-contain hover:scale-105 ${showBg ? 'h-12 w-12 md:h-14 md:w-14' : 'h-20 w-20 md:h-21.25 md:w-21.25'}`}
                            />
                        </Link>
                    </div>

                    {/* Col 2 — Nav Links (True Center) with 2-Column Mega Menus */}
                    <ul className="hidden lg:flex items-center justify-center gap-5 xl:gap-7">
                        {navLinks.map((link) => {
                            const hasSubLinks = link.subLinks && link.subLinks.length > 0;

                            if (hasSubLinks) {
                                return (
                                    <li key={link.name} className="group py-6">
                                        <button className="flex items-center gap-1.5 text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-all duration-300 hover:text-brand-red whitespace-nowrap cursor-pointer">
                                            {link.name}
                                            <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-white/50 group-hover:text-brand-red" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Full-Width Mega Dropdown Menu panel */}
                                        <div className="absolute inset-x-0 top-0 w-screen left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 -z-50  group-hover:pointer-events-auto">
                                            <div className="bg-[#0e0404]/98 border-b border-t border-white/10 backdrop-blur-[25px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative py-8">
                                                {/* Centered content grid aligned to container grid */}
                                                <div className="mx-auto max-w-container-max-width px-3.75 pt-20 md:px-12.5 w-full grid grid-cols-12 gap-8">
                                                    
                                                    {/* Left Column (Visual Promo Box) */}
                                                    <div className="col-span-4 bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6 relative overflow-hidden group/promo">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl"></div>
                                                        <div className="space-y-1.5 relative z-10">
                                                            <span className="text-[9px] font-black text-brand-red uppercase tracking-[0.25em]">Vahlay Astro</span>
                                                            <h3 className="text-base font-bold text-white tracking-wide leading-tight">
                                                                {link.name === 'Services' ? 'Sacred Services & Wisdom' : 'Consecrated Spiritual Items'}
                                                            </h3>
                                                            <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                                                                {link.name === 'Services' 
                                                                    ? 'Explore Vedic courses, planetary remedies, rituals, and direct consultations.' 
                                                                    : 'Authentic malas, crystal bracelets, and rings energized to invite prosperity.'}
                                                            </p>
                                                        </div>
                                                        <Link 
                                                            to={link.name === 'Services' ? '/services' : '/products'}
                                                            className="inline-flex items-center gap-1.5 text-[9.5px] font-black text-white bg-brand-red hover:bg-white hover:text-brand-red px-4 py-2.5 w-fit rounded-lg uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(191, 6, 3,0.3)] relative z-10"
                                                        >
                                                            {link.name === 'Services' ? 'See Overview' : 'View Shop'}
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        </Link>
                                                    </div>

                                                    {/* Right Column (Links Navigation List - Plain Text Links) */}
                                                    <div className="col-span-8 p-4 flex flex-col gap-1.5 justify-center max-w-md">
                                                        <span className="underline underline-offset-4 font-bold text-white uppercase tracking-[0.25em] pl-4 mb-2">
                                                            {link.name === 'Services' ? 'Explore Services' : 'Browse Categories'}
                                                        </span>
                                                        {link.subLinks.map((subLink) => (
                                                            <Link
                                                                key={subLink.name}
                                                                to={subLink.path}
                                                                className="block py-2.5 px-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-[13px] font-bold uppercase tracking-[0.15em] transition-all duration-200"
                                                            >
                                                                {subLink.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }

                            return (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-all duration-300 hover:text-brand-red whitespace-nowrap"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Col 3 — Right Controls */}
                    <div className="flex items-center justify-end gap-2 md:gap-3">
                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <>
                                    <Link
                                        to={isAdmin ? "/admin" : "/dashboard"}
                                        className="px-4 py-1.5 rounded font-bold text-[13px] hover:text-brand-red uppercase tracking-[0.15em] transition-all duration-500 text-white whitespace-nowrap"
                                    >
                                        {isAdmin ? "Admin" : "Dashboard"}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-1.5 rounded font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 border border-white text-white hover:bg-white hover:text-black whitespace-nowrap"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-1.5 rounded font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 border border-white text-white hover:bg-white hover:text-black whitespace-nowrap"
                                >
                                    Login
                                </Link>
                            )}
                            <Link
                                to="/contact"
                                className="px-4 xl:px-6 py-2 rounded font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 bg-brand-red text-white hover:bg-white hover:text-brand-red whitespace-nowrap shadow-[0_0_20px_rgba(191, 6, 3,0.3)]"
                            >
                                Contact Us
                            </Link>
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden flex flex-col gap-1.5 p-2 z-1100 focus:outline-none"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Navigation Menu */}
            <div
                className={`fixed inset-0 bg-[#080808]/98 backdrop-blur-lg transition-all duration-500 lg:hidden flex flex-col items-center justify-center gap-8 z-1050 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
                    }`}
            >
                {/* Background Decorative Glow */}
                <div className="absolute top-[-10%] right-[-10%] w-75 h-75 bg-brand-red/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-75 h-75 bg-[#b0a102]/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center gap-6 w-full max-h-[70vh] overflow-y-auto px-6 custom-scrollbar">
                    {navLinks.map((link) => {
                        const hasSubLinks = link.subLinks && link.subLinks.length > 0;
                        const isSubmenuOpen = activeMobileSubmenu === link.name;

                        if (hasSubLinks) {
                            return (
                                <div key={`mobile_${link.name}`} className="w-full flex flex-col items-center">
                                    <button
                                        onClick={() => setActiveMobileSubmenu(isSubmenuOpen ? null : link.name)}
                                        className="text-xl font-bold uppercase tracking-[0.25em] text-white hover:text-brand-red flex items-center gap-2 transition-all duration-300 focus:outline-none cursor-pointer"
                                    >
                                        {link.name}
                                        <svg className={`w-4 h-4 transition-transform duration-350 ${isSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Expandable Sublinks Menu */}
                                    <div className={`w-full flex flex-col items-center gap-4 transition-all duration-500 overflow-hidden ${
                                        isSubmenuOpen ? 'max-h-87.5 mt-4 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        {link.subLinks.map((subLink) => (
                                            <Link
                                                key={`mobile_sub_${subLink.name}`}
                                                to={subLink.path}
                                                onClick={() => { setIsOpen(false); }}
                                                className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-brand-red transition-all duration-300"
                                            >
                                                {subLink.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={`mobile_${link.name}`}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-xl font-bold uppercase tracking-[0.25em] text-white hover:text-brand-red transition-all duration-300"
                            >
                                {link.name}
                            </Link>
                        );
                    })}

                    <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-70">
                        {user ? (
                            <>
                                <Link
                                    to={isAdmin ? "/admin" : "/dashboard"}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center py-3.5 rounded font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                                >
                                    {isAdmin ? "Admin" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="w-full text-center py-3.5 rounded font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                  to="/login"
                                  onClick={() => setIsOpen(false)}
                                  className="w-full text-center py-3.5 rounded font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                              >
                                  Login
                            </Link>
                        )}
                        <Link
                            to="/contact"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center py-4 rounded font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 bg-brand-red text-white hover:bg-white hover:text-brand-red shadow-[0_10px_30px_rgba(191, 6, 3,0.3)]"
                        >
                            Contact us
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
