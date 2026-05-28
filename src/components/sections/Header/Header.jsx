import logo from "../../../assets/images/common/logos/vahlay_astro logo.webp";
import { auth, db } from '../../../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { headerData } from '../../../data/layout/header';

const Header = () => {
    const { navLinks } = headerData;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [scrolled, setScrolled] = useState(false);
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
                    console.error("Error checking admin status:", error);
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
            console.error("Logout failed", error);
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-2000 w-full h-auto text-white transition-all duration-700 ${showBg && !isOpen
                    ? "border-b border-white/5 backdrop-blur-[15px]"
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
                            background: "linear-gradient(145deg, #dd2727 30%, #b0a102 70%)",
                            filter: "blur(100px)",
                            transform: "scale(1.2)",
                        }}
                    />
                </div>

                <nav className="mx-auto grid items-center transition-all duration-500 relative max-w-container-max-width px-[15px] md:px-[50px] py-0 h-full w-full"
                    style={{ gridTemplateColumns: 'auto 1fr auto' }}
                >
                    {/* Col 1 — Logo (Left) */}
                    <div className={`flex items-center h-full transition-all duration-500 py-2 ${isOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <Link to="/" className="flex items-center" aria-label="Vahlay Astro Home">
                            <img
                                src={logo}
                                alt="Vahlay Astro Logo"
                                loading="lazy"
                                className={`transition-all duration-500 object-contain hover:scale-105 ${showBg ? 'h-12 w-12 md:h-14 md:w-14' : 'h-20 w-20 md:h-[85px] md:w-[85px]'}`}
                            />
                        </Link>
                    </div>

                    {/* Col 2 — Nav Links (True Center) */}
                    <ul className="hidden lg:flex items-center justify-center gap-5 xl:gap-7">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className="text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-all duration-300 hover:text-brand-red whitespace-nowrap"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Col 3 — Right Controls */}
                    <div className="flex items-center justify-end gap-2 md:gap-3">
                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <>
                                    <Link
                                        to={isAdmin ? "/admin" : "/dashboard"}
                                        className="px-4 py-1.5 rounded-full font-bold text-[13px] hover:text-brand-red uppercase tracking-[0.15em] transition-all duration-500 text-white whitespace-nowrap"
                                    >
                                        {isAdmin ? "Admin" : "Dashboard"}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-1.5 rounded-full font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 border border-white text-white hover:bg-white hover:text-black whitespace-nowrap"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-1.5 rounded-full font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 border border-white text-white hover:bg-white hover:text-black whitespace-nowrap"
                                >
                                    Login
                                </Link>
                            )}
                            <Link
                                to="/contact"
                                className="px-4 xl:px-6 py-2 rounded-full font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-500 bg-brand-red text-white hover:bg-white hover:text-brand-red whitespace-nowrap shadow-[0_0_20px_rgba(221,39,39,0.3)]"
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

            {/* Mobile Navigation Menu - Moved outside header to fix backdrop-filter positioning bugs */}
            <div
                className={`fixed inset-0 bg-[#080808] transition-all duration-500 lg:hidden flex flex-col items-center justify-center gap-8 z-1050 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
                    }`}
            >
                {/* Background Decorative Glow */}
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-red/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#b0a102]/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center gap-6 w-full px-6">
                    {navLinks.map((link) => (
                        <Link
                            key={`mobile_${link.name}`}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="text-2xl font-bold uppercase tracking-[0.25em] text-white hover:text-brand-red transition-all duration-300"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-[280px]">
                        {user ? (
                            <>
                                <Link
                                    to={isAdmin ? "/admin" : "/dashboard"}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center py-3.5 rounded-full font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                                >
                                    {isAdmin ? "Admin" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="w-full text-center py-3.5 rounded-full font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="w-full text-center py-3.5 rounded-full font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 border border-white/20 bg-white/5 text-white hover:bg-white hover:text-black"
                            >
                                Login
                            </Link>
                        )}
                        <Link
                            to="/contact"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center py-4 rounded-full font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 bg-brand-red text-white hover:bg-white hover:text-brand-red shadow-[0_10px_30px_rgba(221,39,39,0.3)]"
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
