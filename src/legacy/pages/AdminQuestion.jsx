// QandAAdminPanel.js
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Admin from "./Admin"
import Header from "../../components/sections/Header/Header";



const QandAAdminPanel = () => {
  // --- Course Selection State ---
  const [courses, setCourses] = useState([]); 
  const [selectedCourse, setSelectedCourse] = useState(""); 

  // --- Q&A Items State ---
  const [qandaItems, setQandaItems] = useState([]);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null); 
  const [existingVideoUrl, setExistingVideoUrl] = useState(""); 
  const [editingId, setEditingId] = useState(null);
  const [videoUploadMessage, setVideoUploadMessage] = useState("");

  // --- Comments State ---
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentStatusMessage, setCommentStatusMessage] = useState("");

  const storage = getStorage();

  const fetchCourses = async () => {
    try {
      const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
      const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        courseName: doc.id,
        type: "free",
      }));

      const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
      const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        courseName: doc.id,
        type: "paid",
      }));

      setCourses([...freeCourses, ...paidCourses]);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchQandAItems = async () => {
    if (!selectedCourse) return;
    try {
      const qandaRef = collection(db, "questionAndAnswer");
      const q = query(qandaRef, where("courseName", "==", selectedCourse));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQandaItems(items);
    } catch (error) {
      console.error("Error fetching Q&A items:", error);
    }
  };

  const fetchComments = async () => {
    if (!selectedCourse) return;
    try {
      const commentsRef = collection(db, "Comments_Vahaly_Astro");
      const q = query(commentsRef, where("courseName", "==", selectedCourse));
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchQandAItems();
      fetchComments();
    } else {
      setQandaItems([]);
      setComments([]);
    }
  }, [selectedCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Please fill out the Title.");
    if (!selectedCourse) return alert("Please select a course first.");
    
    try {
      let videoUrl = "";
      if (videoFile) {
        setVideoUploadMessage("Uploading video...");
        const storageRef = ref(storage, `qandaVideos/${Date.now()}_${videoFile.name}`);
        const snapshot = await uploadBytes(storageRef, videoFile);
        videoUrl = await getDownloadURL(snapshot.ref);
        setVideoUploadMessage("Video uploaded successfully!");
      } else if (editingId) {
        videoUrl = existingVideoUrl;
      }

      const qandaData = { title, subTitle, videoUrl, courseName: selectedCourse };

      if (editingId) {
        await updateDoc(doc(db, "questionAndAnswer", editingId), qandaData);
        setEditingId(null);
        setExistingVideoUrl("");
      } else {
        await addDoc(collection(db, "questionAndAnswer"), qandaData);
      }
      
      setTitle("");
      setSubTitle("");
      setVideoFile(null);
      setTimeout(() => setVideoUploadMessage(""), 3000);
      fetchQandAItems();
    } catch (error) {
      console.error("Error saving Q&A item:", error);
      alert("Error saving the item.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubTitle(item.subTitle || "");
    setExistingVideoUrl(item.videoUrl || "");
    setVideoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Q&A item?")) return;
    try {
      await deleteDoc(doc(db, "questionAndAnswer", id));
      fetchQandAItems();
    } catch (error) {
      console.error("Error deleting Q&A item:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName || !commentText) return alert("Please fill out both Name and Comment.");
    if (!selectedCourse) return alert("Please select a course first.");
    
    try {
      setCommentStatusMessage("Saving comment...");
      const commentData = { userName: commentName, comment: commentText, courseName: selectedCourse };
      if (editingCommentId) {
        await updateDoc(doc(db, "Comments_Vahaly_Astro", editingCommentId), commentData);
        setEditingCommentId(null);
      } else {
        await addDoc(collection(db, "Comments_Vahaly_Astro"), commentData);
      }
      setCommentName("");
      setCommentText("");
      setCommentStatusMessage("Comment saved successfully!");
      setTimeout(() => setCommentStatusMessage(""), 3000);
      fetchComments();
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleEditComment = (comm) => {
    setEditingCommentId(comm.id);
    setCommentName(comm.userName);
    setCommentText(comm.comment);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "Comments_Vahaly_Astro", id));
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Admin />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Q&A <span className="text-[#dd2727]">Management</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Moderate inquiries and organize educational responses</p>
            </div>
            
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full md:w-64 bg-gray-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.courseName} className="bg-white">
                  {course.courseName} ({course.type})
                </option>
              ))}
            </select>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Q&A Section */}
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#dd2727] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                  Interactive Items
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder:text-slate-400"
                    placeholder="Inquiry Title"
                  />
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#dd2727] transition-all placeholder:text-slate-400"
                    placeholder="Short Context / Subtitle"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-100 file:text-slate-600 cursor-pointer font-bold uppercase tracking-widest"
                    />
                    {editingId && existingVideoUrl && (
                      <p className="text-[10px] text-[#b0a102] font-bold uppercase mt-2">Current video active</p>
                    )}
                  </div>
                  <button type="submit" className="w-full bg-[#dd2727] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all">
                    {editingId ? "Update Q&A" : "Create Q&A"}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                {qandaItems.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-all group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 tracking-wide group-hover:text-[#dd2727] transition-colors">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{item.subTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-slate-50 text-slate-400 hover:text-white hover:bg-yellow-500 rounded-lg transition-colors border border-slate-100 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                    {item.videoUrl && (
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
                        <video src={item.videoUrl} controls className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Comments Section */}
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#b0a102] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
                  Client Testimonials
                </h3>
                
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#b0a102] transition-all placeholder:text-slate-400"
                    placeholder="Display Name"
                  />
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#b0a102] transition-all h-24 resize-none placeholder:text-slate-400"
                    placeholder="Share the experience..."
                  />
                  <button type="submit" className="w-full bg-[#b0a102] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-yellow-500/20 transition-all">
                    {editingCommentId ? "Update Review" : "Post Review"}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                {comments.map((comm) => (
                  <div key={comm.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-all flex justify-between items-start shadow-sm group">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-bold text-[#b0a102] uppercase tracking-widest mb-1">{comm.userName}</p>
                      <p className="text-sm text-slate-500 leading-relaxed italic font-medium">"{comm.comment}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditComment(comm)} className="p-2 bg-slate-50 text-slate-400 hover:text-white hover:bg-yellow-500 rounded-lg transition-colors border border-slate-100 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDeleteComment(comm.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default QandAAdminPanel;

