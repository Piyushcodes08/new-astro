import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
import {
    collection,
    getDocs,
    doc,
    setDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AdminPortal = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [videoTitle, setVideoTitle] = useState("");
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [materialTitle, setMaterialTitle] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materialUploadProgress, setMaterialUploadProgress] = useState(0);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
                const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));

                const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || `Untitled (ID: ${doc.id})`,
                }));
                const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || `Untitled (ID: ${doc.id})`,
                }));

                setCourses([...freeCourses, ...paidCourses]);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };
        fetchCourses();
    }, []);

    const handleVideoUpload = async () => {
        if (!selectedCourse || !videoTitle || !selectedVideo) {
            alert("Please select a course, enter a video title, and upload a video file.");
            return;
        }

        const storageRef = ref(storage, `videos/${selectedCourse}/${Date.now()}_${selectedVideo.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedVideo);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setVideoUploadProgress(progress);
            },
            (error) => { console.error("Video upload failed:", error); },
            async () => {
                const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const videosRef = doc(db, `videos_${selectedCourse}`, `${Date.now()}`);
                await setDoc(videosRef, { title: videoTitle, url: videoUrl });
                setVideoTitle("");
                setSelectedVideo(null);
                setVideoUploadProgress(0);
                alert("Video uploaded successfully!");
            }
        );
    };

    const handleMaterialUpload = async () => {
        if (!selectedCourse || !materialTitle || !selectedMaterial) {
            alert("Please select a course, enter a material title, and upload a material file.");
            return;
        }

        const storageRef = ref(storage, `studyMaterials/${selectedCourse}/${Date.now()}_${selectedMaterial.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedMaterial);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setMaterialUploadProgress(progress);
            },
            (error) => { console.error("Material upload failed:", error); },
            async () => {
                const materialUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const materialsRef = doc(db, `materials_${selectedCourse}`, `${Date.now()}`);
                await setDoc(materialsRef, { title: materialTitle, url: materialUrl });
                setMaterialTitle("");
                setSelectedMaterial(null);
                setMaterialUploadProgress(0);
                alert("Study material uploaded successfully!");
            }
        );
    };

    return (
        <div className="admin-layout">
            <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
            <Header />
            <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0 pb-0">
                <SideBar />

                <main className="flex-1 py-8">
                    <div className="space-y-10 pt-8">

                        {/* Page Header */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <h4 className="text-[#dd2727] font-black uppercase tracking-[0.4em] text-[10px] mb-2">Admin Panel</h4>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Content <span className="text-[#dd2727]">Upload</span>
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Upload videos and study materials to courses</p>
                        </div>

                        {/* Course Selector */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Course To Upload To:</label>
                            <div className="relative">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none appearance-none cursor-pointer font-bold"
                                >
                                    <option value="">-- Select Course Orbit --</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Upload Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                            {/* Upload Video Card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                                    Upload Video Session
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Transmission Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Introduction to Kundalini"
                                            value={videoTitle}
                                            onChange={(e) => setVideoTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Source File</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setSelectedVideo(e.target.files[0])}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#dd2727] file:text-white hover:file:bg-red-700 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {videoUploadProgress > 0 && (
                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-[#dd2727] h-full rounded-full transition-all" style={{ width: `${videoUploadProgress}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.round(videoUploadProgress)}% Transmitted</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleVideoUpload}
                                        disabled={videoUploadProgress > 0 && videoUploadProgress < 100}
                                        className="flex-1 w-full bg-[#dd2727] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
                                    >
                                        {videoUploadProgress > 0 && videoUploadProgress < 100 ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Transmitting...</span>
                                            </div>
                                        ) : "Upload Transmission"}
                                    </button>
                                </div>
                            </div>

                            {/* Upload Study Material Card */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
                                    Upload Study Material
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Document Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Planet Positions PDF"
                                            value={materialTitle}
                                            onChange={(e) => setMaterialTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Source File</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                            <input
                                                type="file"
                                                onChange={(e) => setSelectedMaterial(e.target.files[0])}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#b0a102] file:text-white hover:file:bg-yellow-700 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {materialUploadProgress > 0 && (
                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-[#b0a102] h-full rounded-full transition-all" style={{ width: `${materialUploadProgress}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.round(materialUploadProgress)}% Archived</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleMaterialUpload}
                                        disabled={materialUploadProgress > 0 && materialUploadProgress < 100}
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#b0a102] transition-all disabled:opacity-50"
                                    >
                                        {materialUploadProgress > 0 && materialUploadProgress < 100 ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Archiving...</span>
                                            </div>
                                        ) : "Upload Material"}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminPortal;

