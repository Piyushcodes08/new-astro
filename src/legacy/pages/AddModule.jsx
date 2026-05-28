import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { IoIosListBox } from "react-icons/io";
import { db, storage } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const AddModule = () => {
  // ORIGINAL LOGIC: State from old folder
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [videoModules, setVideoModules] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialFile, setNewMaterialFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [materialUploadProgress, setMaterialUploadProgress] = useState(0);
  const [editVideo, setEditVideo] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadTask, setUploadTask] = useState(null);
  
  // NEW: Support for ordering from VedioDetail requirements
  const [videoOrder, setVideoOrder] = useState(0);
  const [titleOrder, setTitleOrder] = useState(0);

  // Custom confirmation state (replaces window.confirm to avoid Vite HMR dismissal)
  const [pendingDelete, setPendingDelete] = useState(null); // { item, type }

  // ORIGINAL LOGIC: Fetch courses
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

  // ORIGINAL LOGIC: Fetch modules when course changes
  useEffect(() => {
    if (selectedCourse) {
      const fetchModules = async () => {
        try {
          const videosSnapshot = await getDocs(collection(db, `videos_${selectedCourse}`));
          const materialsSnapshot = await getDocs(collection(db, `materials_${selectedCourse}`));

          const videoData = videosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const materialData = materialsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          setVideoModules(videoData);
          setStudyMaterials(materialData);
        } catch (error) {
          console.error("Error fetching modules:", error);
        }
      };

      fetchModules();
    } else {
      setVideoModules([]);
      setStudyMaterials([]);
    }
  }, [selectedCourse]);

  // ORIGINAL LOGIC: handleUpload with improved ID handling and ordering
  const handleUpload = async (title, description, file, type) => {
    try {
      if (!selectedCourse) {
        alert("Please select a course first.");
        return;
      }
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      setUploading(true);
      const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
      const uploadTaskInstance = uploadBytesResumable(storageRef, file);
      setUploadTask(uploadTaskInstance);

      uploadTaskInstance.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (type === "videos") setVideoUploadProgress(progress);
          else setMaterialUploadProgress(progress);
        },
        (error) => {
          console.error("File upload failed:", error);
          setUploading(false);
          alert("Upload failed. Please try again.");
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTaskInstance.snapshot.ref);
          const collectionRef = collection(db, `${type}_${selectedCourse}`);

          const docData = { 
            title, 
            url: fileUrl,
            timestamp: new Date().toISOString()
          };

          if (type === "videos") {
            docData.description = description;
            docData.order = parseInt(videoOrder) || 0;
            docData["title-order"] = parseInt(titleOrder) || 0;
          }

          const docRef = await addDoc(collectionRef, docData);
          alert("Uploaded successfully");

          if (type === "videos") {
            setVideoModules([...videoModules, { id: docRef.id, ...docData }]);
            setVideoUploadProgress(0);
            setNewVideoTitle("");
            setNewVideoDescription("");
          } else {
            setStudyMaterials([...studyMaterials, { id: docRef.id, ...docData }]);
            setMaterialUploadProgress(0);
            setNewMaterialTitle("");
          }
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading:", error);
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setUploading(false);
      setVideoUploadProgress(0);
      setMaterialUploadProgress(0);
      alert("Upload canceled.");
    }
  };

  // Step 1: Show custom confirm dialog
  const handleDelete = (e, item, type) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPendingDelete({ item, type });
  };

  // Step 2: Actually perform deletion after user confirms
  const confirmDeleteAction = async () => {
    if (!pendingDelete) return;
    const { item, type } = pendingDelete;
    const collectionPath = `${type}_${selectedCourse}`;
    setPendingDelete(null);

    try {
      // 1. Delete file from Firebase Storage if URL exists
      if (item.url) {
        try {
          const fileRef = ref(storage, item.url);
          await deleteObject(fileRef);
        } catch (storageError) {
          console.warn("Storage deletion skipped:", storageError.code);
        }
      }

      // 2. Delete Firestore document
      await deleteDoc(doc(db, collectionPath, item.id));

      // 3. Update local state immediately
      if (type === "videos") {
        setVideoModules(prev => prev.filter(m => m.id !== item.id));
        setEditVideo(null);
      } else {
        setStudyMaterials(prev => prev.filter(m => m.id !== item.id));
        setEditMaterial(null);
      }

      console.log("Deleted successfully:", item.id);
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  const handleEdit = async (id, updatedTitle, updatedDescription, file, type) => {
    try {
      let fileUrl = null;

      if (file) {
        setUploading(true);
        const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (type === "videos") setVideoUploadProgress(progress);
            else setMaterialUploadProgress(progress);
          },
          (error) => {
            console.error("File upload failed:", error);
            setUploading(false);
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const updatedData = { title: updatedTitle };
            if (type === "videos") updatedData.description = updatedDescription;
            if (fileUrl) updatedData.url = fileUrl;

            await updateDoc(doc(db, `${type}_${selectedCourse}`, id), updatedData);
            
            // Update local state
            if (type === "videos") {
              setVideoModules(videoModules.map(v => v.id === id ? { ...v, ...updatedData } : v));
            } else {
              setStudyMaterials(studyMaterials.map(m => m.id === id ? { ...m, ...updatedData } : m));
            }

            alert("Updated successfully");
            setUploading(false);
            setEditVideo(null);
            setEditMaterial(null);
            setVideoUploadProgress(0);
            setMaterialUploadProgress(0);
          }
        );
      } else {
        const updatedData = { title: updatedTitle };
        if (type === "videos") updatedData.description = updatedDescription;
        
        await updateDoc(doc(db, `${type}_${selectedCourse}`, id), updatedData);
        
        if (type === "videos") {
          setVideoModules(videoModules.map(v => v.id === id ? { ...v, ...updatedData } : v));
        } else {
          setStudyMaterials(studyMaterials.map(m => m.id === id ? { ...m, ...updatedData } : m));
        }

        alert("Updated successfully");
        setEditVideo(null);
        setEditMaterial(null);
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // ORIGINAL LOGIC: Grouping videos by module title
  const groupedVideos = videoModules.reduce((acc, module) => {
    const key = module.title || "Untitled Module";
    if (!acc[key]) acc[key] = [];
    acc[key].push(module);
    return acc;
  }, {});

  // Sort groups by title-order if available
  const sortedGroupKeys = Object.keys(groupedVideos).sort((a, b) => {
    const orderA = groupedVideos[a][0]["title-order"] || 0;
    const orderB = groupedVideos[b][0]["title-order"] || 0;
    return orderA - orderB;
  });

  return (
    <div className="admin-layout">

      {/* Custom Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-red-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Delete Permanently?</h3>
              <p className="text-sm text-slate-500">This will remove the file from storage and database. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPendingDelete(null)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={confirmDeleteAction} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0 pb-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            {/* Course Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm pt-8">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Course To Manage:</label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none appearance-none cursor-pointer font-bold"
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            {selectedCourse ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Upload Video Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                      Upload Video Session
                    </h2>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Module / Video Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Module 1: Introduction"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Module Order</label>
                          <input
                            type="number"
                            value={titleOrder}
                            onChange={(e) => setTitleOrder(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Video Order</label>
                          <input
                            type="number"
                            value={videoOrder}
                            onChange={(e) => setVideoOrder(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none"
                          />
                        </div>
                      </div>
                      
                      <textarea
                        placeholder="Video Description (displays in player)"
                        value={newVideoDescription}
                        onChange={(e) => setNewVideoDescription(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 h-32 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all resize-none placeholder:text-gray-400"
                      />
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <input
                          type="file"
                          onChange={(e) => setNewVideoFile(e.target.files[0])}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#dd2727] file:text-white hover:file:bg-red-700 cursor-pointer"
                        />
                      </div>

                      {videoUploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#dd2727] h-full rounded-full transition-all" style={{ width: `${videoUploadProgress}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.round(videoUploadProgress)}% Transmitted</p>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleUpload(newVideoTitle, newVideoDescription, newVideoFile, "videos")}
                          disabled={uploading}
                          className="flex-1 bg-[#dd2727] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
                        >
                          {uploading ? "Transmitting..." : "Upload Video"}
                        </button>
                        {uploading && (
                          <button onClick={cancelUpload} className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-[10px]">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Material Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
                      Upload Study Material
                    </h2>
                    <div className="space-y-5">
                      <input
                        type="text"
                        placeholder="Material Title (e.g. Course PDF)"
                        value={newMaterialTitle}
                        onChange={(e) => setNewMaterialTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                      />
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <input
                          type="file"
                          onChange={(e) => setNewMaterialFile(e.target.files[0])}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#b0a102] file:text-white hover:file:bg-yellow-700 cursor-pointer"
                        />
                      </div>

                      {materialUploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#b0a102] h-full rounded-full transition-all" style={{ width: `${materialUploadProgress}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.round(materialUploadProgress)}% Transmitted</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleUpload(newMaterialTitle, "", newMaterialFile, "materials")}
                        disabled={uploading}
                        className="w-full bg-[#b0a102] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-50"
                      >
                        {uploading ? "Transmitting..." : "Upload Material"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Lists */}
                <div className="space-y-12">
                  {/* Video Sessions List */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-[#dd2727] rounded-full"></span>
                      Video Sessions
                    </h3>
                    <div className="space-y-6">
                      {sortedGroupKeys.length > 0 ? sortedGroupKeys.map((title) => {
                        const modules = groupedVideos[title];
                        return (
                          <div key={title} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-bold text-[#b0a102] uppercase tracking-widest">{title}</h4>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Order: {modules[0]["title-order"] || 0}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {modules.map((module) => (
                                <div key={module.id} className="bg-gray-50 border border-gray-200 p-6 rounded-2xl relative group/item">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                      <h5 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover/item:text-[#dd2727] transition-colors">{module.description || "No Description"}</h5>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seq: {module.order || 0}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => setEditVideo(module)} className="p-2 bg-white border border-slate-200 hover:bg-yellow-500 hover:text-white text-yellow-600 rounded-xl transition-all shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                      </button>
                                      <button onClick={(e) => handleDelete(e, module, "videos")} className="p-2 bg-white border border-slate-200 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all shadow-sm relative z-30">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                      </button>
                                    </div>
                                  </div>
                                  <a href={module.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#dd2727] uppercase tracking-widest hover:underline">View Session →</a>

                                  {editVideo && editVideo.id === module.id && (
                                    <div className="mt-6 p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm relative z-20">
                                      <input type="text" defaultValue={module.title} onChange={(e) => (module.title = e.target.value)} className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-[#dd2727]" />
                                      <textarea defaultValue={module.description} onChange={(e) => (module.description = e.target.value)} className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-xs outline-none h-24 resize-none focus:ring-2 focus:ring-[#dd2727]" />
                                      <input type="file" onChange={(e) => (module.newFile = e.target.files[0])} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest" />
                                      <div className="flex gap-2">
                                        <button onClick={() => handleEdit(module.id, module.title, module.description, module.newFile, "videos")} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-green-700 transition-all shadow-md">Save</button>
                                        <button onClick={() => setEditVideo(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No videos found for this course</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Study Materials List */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                      Study Materials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {studyMaterials.length > 0 ? studyMaterials.map((material) => (
                        <div key={material.id} className="bg-white border border-slate-200 p-8 rounded-2xl group relative shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#b0a102] transition-colors">{material.title}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => setEditMaterial(material)} className="p-2 bg-white border border-slate-200 hover:bg-yellow-500 hover:text-white text-yellow-600 rounded-xl transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              <button onClick={(e) => handleDelete(e, material, "materials")} className="p-2 bg-white border border-slate-200 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#b0a102] uppercase tracking-widest hover:underline">View Material →</a>
                          
                          {editMaterial && editMaterial.id === material.id && (
                            <div className="mt-6 p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm relative z-20">
                              <input type="text" defaultValue={material.title} onChange={(e) => (material.title = e.target.value)} className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-[#b0a102]" />
                              <input type="file" onChange={(e) => (material.newFile = e.target.files[0])} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest" />
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(material.id, material.title, "", material.newFile, "materials")} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-green-700 transition-all shadow-md">Save</button>
                                <button onClick={() => setEditMaterial(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )) : (
                        <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">No study materials available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoIosListBox size={40} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Manage Modules</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Please select a course from the dropdown above to begin uploading videos and study materials.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddModule;

