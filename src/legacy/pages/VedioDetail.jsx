
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    onSnapshot,
    addDoc,
    serverTimestamp,
    increment,
    query,
    where,
    orderBy,
    limit
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ReactPlayer from 'react-player';
import Header from "../../components/sections/Header/Header";
import Aside from "./Aside";
import Footer from "../../components/sections/Footer/Footer";
import defaultThumbnail from '../../assets/images/common/logos/vahlay_astro logo.webp';

const VideoDetailsPage = () => {
    const { courseName, videoId } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [ads, setAds] = useState([]);
    const [likes, setLikes] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchedVideos, setWatchedVideos] = useState([]);
    const [orderedVideos, setOrderedVideos] = useState([]);
    const [resolvedCourseId, setResolvedCourseId] = useState(courseName || "");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user && resolvedCourseId) {
                const userSubRef = doc(db, "subscriptions", user.email);
                getDoc(userSubRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const details = docSnap.data().DETAILS;
                        if (details && Array.isArray(details)) {
                            const courseData = details.find(d => Object.keys(d)[0] === resolvedCourseId);
                            if (courseData) {
                                setWatchedVideos(courseData[resolvedCourseId].watchedVideos || []);
                            }
                        }
                    }
                });
            }
        });
        return () => unsubscribe();
    }, [resolvedCourseId]);

    useEffect(() => {
        const fetchData = async () => {
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

                const videosRef = collection(db, `videos_${dbCourseId}`);
                const videosSnapshot = await getDocs(videosRef);

                let allVideos = videosSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const videoUrl = (data.url || data.videoUrl || data.link || "").trim();
                    const ytId = extractYTId(videoUrl);

                    return {
                        id: doc.id,
                        ...data,
                        url: videoUrl,
                        thumbnail: data.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : defaultThumbnail),
                        displayTitle: data.description || data.title || "Untitled Lesson",
                        order: parseInt(data.order) || 0,
                        titleOrder: parseInt(data["title-order"]) || 0
                    };
                });

                const currentVideo = allVideos.find(video => video.id === videoId);
                if (!currentVideo) {
                    if (allVideos.length > 0) {
                        navigate(`/course/${courseName}/video/${allVideos[0].id}`);
                    }
                    setLoading(false);
                    return;
                }

                setActiveVideo(currentVideo);
                setLikes(currentVideo.likes || 0);

                const sortedVideos = [...allVideos].sort((a, b) => {
                    if (a.titleOrder !== b.titleOrder) {
                        return a.titleOrder - b.titleOrder;
                    }
                    return a.order - b.order;
                });

                setOrderedVideos(sortedVideos);

                const adsRef = collection(db, "ads");
                const adsSnapshot = await getDocs(adsRef);
                setAds(adsSnapshot.docs.map(doc => doc.data()));

                const commentsQuery = query(
                    collection(db, "Comments_Vahaly_Astro"),
                    where("courseName", "==", dbCourseId),
                    where("videoId", "==", videoId)
                );

                const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
                    const fetchedComments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setComments(fetchedComments.sort((a, b) => b.timestamp - a.timestamp));
                });

                setLoading(false);
                return () => unsubscribeComments();
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [courseName, videoId]);

    const extractYTId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const markVideoAsWatched = async () => {
        if (!user || !resolvedCourseId) return;
        try {
            const userSubRef = doc(db, "subscriptions", user.email);
            const docSnap = await getDoc(userSubRef);
            if (docSnap.exists()) {
                const subscriptions = docSnap.data().DETAILS;
                const courseIndex = subscriptions.findIndex(d => Object.keys(d)[0] === resolvedCourseId);
                if (courseIndex !== -1) {
                    const updatedSubs = [...subscriptions];
                    const watched = new Set(updatedSubs[courseIndex][resolvedCourseId].watchedVideos || []);
                    watched.add(videoId);
                    updatedSubs[courseIndex][resolvedCourseId].watchedVideos = Array.from(watched);
                    await updateDoc(userSubRef, { DETAILS: updatedSubs });
                    setWatchedVideos(Array.from(watched));
                }
            }
        } catch (err) {
            console.error("Error marking video as watched:", err);
        }
    };

    const handleVideoSelect = (video) => {
        navigate(`/course/${courseName}/video/${video.id}`);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !resolvedCourseId) return;
        try {
            await addDoc(collection(db, "Comments_Vahaly_Astro"), {
                courseName: resolvedCourseId,
                videoId,
                comment: newComment.trim(),
                userName: user.displayName || "Anonymous",
                userId: user.uid,
                timestamp: serverTimestamp(),
            });
            setNewComment("");
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleLike = async () => {
        if (!user || userLiked || !resolvedCourseId) return;
        try {
            const videoRef = doc(db, `videos_${resolvedCourseId}`, videoId);
            await updateDoc(videoRef, { likes: increment(1) });
            setUserLiked(true);
            setLikes(prev => prev + 1);
        } catch (err) {
            console.error("Error updating likes:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Header />

            <div className="flex flex-1 relative z-10 pt-16 gap-0">
                <Aside />

                <main className="flex-1 min-w-0 p-4 md:p-10 flex flex-col lg:flex-row gap-8 overflow-x-hidden pt-8">

                    {/* Left Column: Video & Info */}
                    <div className="flex-1 lg:w-3/4 space-y-6 pb-20">

                        {/* Video Player Section - Responsive aspect ratio */}
                        <div className="bg-black aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                            {activeVideo?.url ? (
                                <div className="w-full h-full">
                                    {activeVideo.url.includes('youtube.com') || activeVideo.url.includes('youtu.be') || activeVideo.url.includes('vimeo.com') || activeVideo.url.includes('drive.google.com') ? (
                                        <ReactPlayer url={activeVideo.url} controls playing={true} width="100%" height="100%" onEnded={markVideoAsWatched} />
                                    ) : (
                                        <video key={activeVideo.url} src={activeVideo.url} controls autoPlay muted className="w-full h-full object-contain" onEnded={markVideoAsWatched} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-slate-900 text-white/30 text-[10px] uppercase tracking-[0.4em] font-black">Video Connection Offline</div>
                            )}
                        </div>

                        {/* Video Title and Likes Card */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight mb-4 uppercase tracking-tight">
                                        {activeVideo?.displayTitle}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                            Module {activeVideo?.titleOrder} • Lesson {activeVideo?.order}
                                        </div>
                                        {watchedVideos.includes(videoId) && (
                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                                Completed Path
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLike}
                                    className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 px-6 py-3 rounded-2xl transition-all group self-start"
                                >
                                    <span className={`text-xl ${userLiked ? 'text-red-500' : 'text-slate-300'} group-hover:scale-110 transition-transform`}>❤</span>
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{likes} Soul Likes</span>
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Disciple Discussions ({comments.length})</h2>
                            </div>

                            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-10">
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#dd2727]/5 focus:border-[#dd2727] transition-all resize-none h-24 placeholder:text-slate-400 font-medium"
                                    placeholder="Share your enlightenment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-[#dd2727] text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-8">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-5 items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-[#dd2727]/5 border border-[#dd2727]/10 flex items-center justify-center font-black text-[#dd2727] flex-shrink-0 text-lg">
                                            {comment.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{comment.userName}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                                    {comment.timestamp?.toDate().toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{comment.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-[10px] font-black italic uppercase tracking-[0.3em]">No discourse found yet in this lesson.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Playlist */}
                    <aside className="lg:w-1/4 space-y-8">
                        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Course Sequence</h3>
                                <div className="px-2 py-0.5 bg-white rounded-full border border-slate-100 text-[8px] font-black text-slate-400">
                                    {orderedVideos.length} LESSONS
                                </div>
                            </div>
                            <div className="max-h-[50vh] lg:max-h-[65vh] overflow-y-auto custom-scrollbar">
                                {orderedVideos.map((video) => {
                                    const isActive = video.id === videoId;
                                    const isWatched = watchedVideos.includes(video.id);

                                    return (
                                        <button
                                            key={video.id}
                                            onClick={() => handleVideoSelect(video)}
                                            className={`w-full group flex items-center gap-4 p-4 transition-all text-left border-b border-slate-50/50 ${isActive ? 'bg-red-50 border-l-4 border-l-[#dd2727]' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="relative w-20 aspect-video bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                                <img 
                                                    src={video.thumbnail} 
                                                    alt="" 
                                                    className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultThumbnail; }}
                                                />
                                                {isWatched && (
                                                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">✓</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-[#dd2727]' : 'text-slate-400'}`}>
                                                    M{video.titleOrder} • L{video.order}
                                                </p>
                                                <h5 className={`text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2 ${isActive ? 'text-[#dd2727]' : 'text-slate-700'}`}>
                                                    {video.displayTitle}
                                                </h5>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ads - Premium Styling */}
                        {ads.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 ml-2">
                                    <div className="w-1 h-3 bg-slate-200 rounded-full"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Sponsored Path</p>
                                </div>
                                {ads.map((ad, index) => (
                                    <a key={index} href={ad.link} target="_blank" rel="noopener noreferrer" className="block group">
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white group-hover:border-[#dd2727]/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 duration-500">
                                            <img src={ad.imageUrl} alt="" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-1000" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </aside>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VideoDetailsPage;

