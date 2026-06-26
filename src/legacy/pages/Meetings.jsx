import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Draggable from 'react-draggable';
import { useParams } from 'react-router-dom';
import Aside from '../pages/Aside';
import Header from "../../components/sections/Header/Header";

const CourseMeetingPopup = () => {
    const { courseName } = useParams();
    const [resolvedCourseId, setResolvedCourseId] = useState(courseName || "");
    const [meetings, setMeetings] = useState([]);
    const [iframeUrl, setIframeUrl] = useState('');
    const [showIframe, setShowIframe] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                // Resolve real database ID first!
                let dbCourseId = courseName;

                // Try to match in freeCourses
                const freeSnap = await getDocs(collection(db, "freeCourses"));
                const normalizedSearch = courseName.toLowerCase().replace(/[^a-z0-9]/g, "");

                let foundFree = freeSnap.docs.find(doc => 
                    doc.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
                    (doc.data().title || doc.data().Title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch
                );

                if (foundFree) {
                    dbCourseId = foundFree.id;
                } else {
                    // Try to match in paidCourses
                    const paidSnap = await getDocs(collection(db, "paidCourses"));
                    let foundPaid = paidSnap.docs.find(doc => 
                        doc.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
                        (doc.data().title || doc.data().Title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedSearch ||
                        ((normalizedSearch.includes("bhagwad") || normalizedSearch.includes("bhadvad") || normalizedSearch.includes("bhagavad")) &&
                         (doc.id.toLowerCase().includes("geeta") || doc.id.toLowerCase().includes("gita")))
                    );

                    if (foundPaid) {
                        dbCourseId = foundPaid.id;
                    }
                }

                setResolvedCourseId(dbCourseId);

                const meetingsRef = collection(db, 'meetings');
                const q = query(meetingsRef, where('courseId', '==', dbCourseId));
                const querySnapshot = await getDocs(q);
                let meetingDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Sort by start date
                meetingDocs.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

                // Transform roomUrl to embedUrl for iframe usage
                meetingDocs = meetingDocs.map(m => {
                    if (m.ringCentralMeeting?.roomUrl) {
                        const roomName = m.ringCentralMeeting.roomUrl.split('/').pop();
                        return {
                            ...m,
                            ringCentralMeeting: {
                                ...m.ringCentralMeeting,
                                embedUrl: `https://whereby.com/embed/${roomName}`
                            }
                        };
                    }
                    return m;
                });

                setMeetings(meetingDocs);
            } catch (err) {
                console.error("Error fetching meetings:", err);
            }
        };

        fetchMeetings();
    }, [courseName]);

    const handleOpenPopup = (url) => {
        // If user passes the normal room URL, convert to embed automatically
        let finalUrl = url;
        if (url.includes('whereby.com') && !url.includes('/embed/')) {
            const roomName = url.split('/').pop();
            finalUrl = `https://whereby.com/embed/${roomName}`;
        }

        setIframeUrl(finalUrl);
        setShowIframe(true);
        setIsFullscreen(false);
    };

    const handleClosePopup = () => {
        setShowIframe(false);
        setIframeUrl('');
        setIsFullscreen(false);
    };

    if (!meetings) return <h1>Loading...</h1>;

    return (
        <div className="admin-layout min-h-screen flex flex-col">
            <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
            <Header />

            <div className="flex flex-1 relative z-10">
                <Aside />
                <main className="flex-1 admin-fluid-container bg-gray-50/50 p-4 md:p-10 pt-32">
                    <div className="max-w-4xl mx-auto space-y-10 pt-[50px]">

                        {/* Page Header */}
                        <div className="border-b border-slate-200 pb-8">
                            <h4 className="text-[#bf0603] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Academic Portal</h4>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                Live <span className="text-[#bf0603]">Sessions</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Course: <span className="text-slate-600">{courseName}</span></p>
                        </div>

                        {meetings.length === 0 ? (
                            <div className="admin-card p-20 text-center bg-white">
                                <div className="text-5xl mb-6">📡</div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">No Sessions Scheduled</h3>
                                <p className="text-slate-400 font-medium text-sm">No live meetings have been scheduled for this course yet. Check back soon.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {meetings.map((m) => (
                                    <div key={m.id} className="admin-card p-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#bf0603] transition-all">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#bf0603] transition-colors">
                                                <span className="w-3 h-3 rounded-full bg-[#bf0603] group-hover:bg-white animate-pulse transition-colors"></span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{m.subject}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(m.startDate).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto">
                                            {m.ringCentralMeeting?.roomUrl ? (
                                                <button
                                                    onClick={() => handleOpenPopup(m.ringCentralMeeting.roomUrl)}
                                                    className="w-full md:w-auto bg-[#bf0603] text-white px-10 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                                >
                                                    Join Now
                                                </button>
                                            ) : (
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-5 py-2.5 rounded-xl border border-slate-200">Link Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {showIframe && (
                    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col ${isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-5xl h-[80vh]'}`}>
                            <div className="flex justify-between items-center p-5 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">🔴 Cosmic Live Session</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
                                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                    >
                                        {isFullscreen ?
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0M4 4l0 5m11 0l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5m11 0l5 5m0 0l-5 0m5 0l0-5" /></svg> :
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                        }
                                    </button>
                                    <button onClick={handleClosePopup} className="p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <iframe
                                src={iframeUrl}
                                className="w-full flex-grow border-0"
                                allow="camera; microphone; fullscreen; speaker; display-capture"
                                allowFullScreen
                                title="Cosmic Meeting"
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseMeetingPopup;

