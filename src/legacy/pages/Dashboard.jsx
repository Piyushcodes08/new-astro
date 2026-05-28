import React, { useState, useEffect } from 'react'
import Aside from './Aside'
import Header from '../../components/sections/Header/Header'
import Footer from '../../components/sections/Footer/Footer'
import { db } from '../../firebaseConfig'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import defaultCourseImage from '../../assets/images/pages/courses/courses.webp'
import basicsImg from '../../assets/images/pages/courses/basics.webp'
import geetaImg from '../../assets/images/pages/courses/geeta.webp'
import naradImg from '../../assets/images/pages/courses/narad.webp'
import foundationImg from '../../assets/images/pages/courses/foundation.webp'

const getFallbackImage = (courseName) => {
    if (!courseName) return defaultCourseImage;
    const name = courseName.toLowerCase();
    if (name.includes('basic')) return basicsImg;
    if (name.includes('geeta')) return geetaImg;
    if (name.includes('narad')) return naradImg;
    if (name.includes('foundation')) return foundationImg;
    return defaultCourseImage;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            setUser(currentUser);

            try {
                // Fetch user subscriptions
                const docRef = doc(db, "subscriptions", currentUser.email);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Fetch metadata for images from correct collections
                    const courseTypes = ["freeCourses", "paidCourses"];
                    const coursesMetadata = {};

                    for (const type of courseTypes) {
                        const coursesSnap = await getDocs(collection(db, type));
                        coursesSnap.forEach(doc => {
                            const d = doc.data();
                            const courseName = d.Title || d.title;
                            if (courseName) {
                                coursesMetadata[courseName] = d.imageUrl || d.image || d.thumbnail || d.courseImage || d.imgUrl || "";
                            }
                        });
                    }

                    const enrolled = [
                        ...(data.freecourses || []),
                        ...(data.DETAILS?.map(c => Object.keys(c)[0]) || [])
                    ].slice(0, 3); // Top 3 for dashboard

                    setCourses(enrolled.map(name => ({
                        name,
                        image: coursesMetadata[name] || getFallbackImage(name)
                    })));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="admin-layout min-h-screen flex flex-col bg-slate-50">
            <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
            <Header />

            <div className="flex flex-1 relative z-10 pt-16 gap-0">
                <Aside />

                <main className="flex-1 min-w-0 py-6 px-[15px] md:px-[50px] bg-white overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-10 pt-6">

                        {/* Welcome Banner - Premium Responsive Card */}
                        <div className="bg-slate-50 p-6 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden text-center flex flex-col items-center">
                            <div className="relative z-10 w-full">
                                <div className="flex flex-col items-center justify-center mb-6 md:mb-10">
                                    <h4 className="text-[#dd2727] font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px] mb-3 md:mb-4">Cosmic Journey</h4>
                                    <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                                        Welcome Back, <br className="hidden md:block" />
                                        <span className="text-[#dd2727]">{user?.displayName?.split(' ')[0] || 'Seeker'}</span>
                                    </h2>
                                    <div className="mt-6 md:mt-8 flex items-center gap-3 px-5 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Celestial Connection Active</span>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm md:text-lg leading-relaxed mb-10 md:mb-12 font-medium max-w-2xl mx-auto px-4">
                                    Your path to enlightenment continues. Review your progress and continue your learning below.
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-6">
                                    <Link to="/enrolledcourse" className="w-full sm:w-auto bg-[#dd2727] text-white px-10 py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:shadow-2xl transition-all hover:-translate-y-1 hover:bg-[#b91d1d]">
                                        Resume Learning
                                    </Link>
                                    <Link to="/courses" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:shadow-xl transition-all hover:-translate-y-1">
                                        Explore Courses
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Courses Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h4 className="text-[#dd2727] font-black uppercase tracking-[0.3em] text-[10px] mb-1">Continue Path</h4>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Recent Enrollments</h3>
                                </div>
                                <Link to="/enrolledcourse" className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-[#dd2727] uppercase tracking-widest transition-colors flex items-center gap-2 group">
                                    View All <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-64 md:h-80 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100"></div>)
                                ) : courses.length > 0 ? (
                                    courses.map((course, idx) => (
                                        <Link
                                            to={`/course/${encodeURIComponent(course.name)}`}
                                            key={idx}
                                            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col border-b-4 hover:border-[#dd2727]"
                                        >
                                            <div className="aspect-video overflow-hidden relative">
                                                <img
                                                    src={course.image}
                                                    alt={course.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = getFallbackImage(course.name); }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Continue Journey →</span>
                                                </div>
                                            </div>
                                            <div className="p-6 md:p-8 flex items-center justify-center text-center">
                                                <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-2 group-hover:text-[#dd2727] transition-colors leading-relaxed">
                                                    {course.name}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 md:py-24 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 border-dashed">
                                        <div className="text-4xl mb-6 opacity-40">🔭</div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No sacred paths found yet.</p>
                                        <Link to="/courses" className="mt-8 inline-block bg-[#dd2727] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all">Start Journey</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default Dashboard;


