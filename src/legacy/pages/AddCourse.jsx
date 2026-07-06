import React, { useState, useEffect } from "react";
import SideBar from "./Admin";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AddCourse = () => {
  // ORIGINAL LOGIC: State from old folder
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSubTitle, setCourseSubTitle] = useState("");
  const [courseType, setCourseType] = useState("free");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const storage = getStorage();

  const fetchCourses = async () => {
    try {
      const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
      const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
      const allCourses = [
        ...freeCoursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...paidCoursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ];
      setCourses(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddOrUpdateCourse = async () => {
    if (!courseTitle || !courseSubTitle || !description || (!imageFile && !editingCourseId)) {
      alert("Course title, description, and image are required");
      return;
    }

    try {
      setIsUploading(true);

      let imageUrl = null;

      if (imageFile) {
        const imageRef = ref(storage, `course-images/${courseTitle}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // ORIGINAL LOGIC: courseData structure with Subtitle (Capital S)
      const courseData = {
        title: courseTitle,
        Subtitle: courseSubTitle,
        type: courseType,
        description,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords.split(',').map(kw => kw.trim()),
        imageUrl: imageUrl || (courses.find((c) => c.id === editingCourseId)?.imageUrl || ""),
      };

      if (!editingCourseId) {
        courseData.createdAt = serverTimestamp();
      }

      if (courseType === "paid") {
        if (!price) {
          alert("Price is required for paid courses");
          return;
        }
        courseData.price = parseFloat(price);
        courseData.status = status;
      }

      const collectionName = courseType === "free" ? "freeCourses" : "paidCourses";
      const courseDocRef = doc(db, collectionName, editingCourseId || courseTitle);
      await setDoc(courseDocRef, courseData, { merge: true });

      alert(editingCourseId ? "Course updated successfully" : "Course added successfully");
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error adding or updating course:", error);
      alert("Failed to save course. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCourse = async (id, type) => {
    if (!window.confirm("Move this course to Trash? You can restore it later.")) return;
    try {
      const collectionName = type === "free" ? "freeCourses" : "paidCourses";
      // Get the course data first
      const courseSnap = await getDocs(collection(db, collectionName));
      const courseDoc = courseSnap.docs.find(d => d.id === id);
      if (!courseDoc) { alert("Course not found."); return; }

      // Save to trash collection with metadata
      await setDoc(doc(db, "trash_courses", id), {
        ...courseDoc.data(),
        _originalCollection: collectionName,
        _originalId: id,
        _deletedAt: serverTimestamp(),
      });

      // Remove from original collection
      await deleteDoc(doc(db, collectionName, id));
      alert("Course moved to Trash. You can restore it from the Trash page.");
      fetchCourses();
    } catch (error) {
      console.error("Error moving course to trash:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleEditCourse = (course) => {
    setCourseTitle(course.title);
    setCourseSubTitle(course.Subtitle);
    setDescription(course.description);
    setSeoTitle(course.seoTitle || '');
    setSeoDescription(course.seoDescription || '');
    setSeoKeywords(course.seoKeywords?.join(', ') || '');
    setCourseType(course.type);
    setPrice(course.price || "");
    setStatus(course.status || "active");
    setEditingCourseId(course.id);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCourseTitle("");
    setCourseSubTitle("");
    setDescription("");
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setCourseType("free");
    setPrice("");
    setStatus("active");
    setImageFile(null);
    setEditingCourseId(null);
    setIsFormVisible(false);
  };

  return (
    <div className="admin-layout">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0 pb-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            <div className="flex justify-between items-center pt-8">
               <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Course <span className="text-[#bf0603]">Management</span>
              </h2>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-[#bf0603] text-white px-3 text-xs py-2 rounded-2xl uppercase tracking-widest hover:shadow-[0_0_30px_rgba(191, 6, 3,0.5)] transition-all"
              >
                {isFormVisible ? "X" : "add new course"}
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#bf0603]/5 rounded-full blur-[100px]"></div>
                
                {/* ORIGINAL TITLE: Add Course / Edit Course */}
                <h3 className="text-xl font-bold text-slate-900 mb-12 pb-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#bf0603] rounded-full"></div>
                  {editingCourseId ? "Edit Course" : "Add Course"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    {/* ORIGINAL LABEL: Course Title */}
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Title</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* ORIGINAL LABEL: Course Subtitle */}
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Subtitle</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={courseSubTitle}
                      onChange={(e) => setCourseSubTitle(e.target.value)}
                      placeholder="Enter course Sub title"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* ORIGINAL LABEL: Course Type */}
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Type</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none appearance-none cursor-pointer"
                      value={courseType}
                      onChange={(e) => setCourseType(e.target.value)}
                    >
                      <option value="free" className="bg-[#050505]">Free</option>
                      <option value="paid" className="bg-[#050505]">Paid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">SEO Title</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Enter SEO Title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">SEO Description</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Enter SEO Description" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">SEO Keywords (comma separated)</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g. astrology, horoscope, zodiac" />
                  </div>
                  
                  {courseType === "paid" && (
                    <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price</label>
                      <input
                        type="number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter course price"
                      />
                    </div>
                  )}
                  {courseType === "paid" && (
                    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#bf0603] outline-none appearance-none cursor-pointer"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="active" className="bg-[#050505]">Active</option>
                        <option value="inactive" className="bg-[#050505]">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white h-40 focus:ring-2 focus:ring-[#bf0603] outline-none transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                  ></textarea>
                </div>

                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Image</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center group/upload hover:border-[#bf0603]/50 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                    <div className="space-y-3">
                      <svg className="w-10 h-10 text-gray-600 mx-auto group-hover/upload:text-[#bf0603] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <p className="text-sm font-medium text-gray-400">{imageFile ? imageFile.name : "Select Celestial Visual"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <button
                    onClick={handleAddOrUpdateCourse}
                    className={`w-full bg-[#bf0603] text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(191, 6, 3,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isUploading}
                  >
                    {isUploading ? "Transmitting Data..." : editingCourseId ? "Update Course" : "Add Course"}
                  </button>
                </div>
              </div>
            )}

            {/* Courses List */}
            <div className="space-y-8">
              {/* ORIGINAL TITLE: Courses */}
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                  Course Library ({courses.length})
                </div>
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <li
                      key={course.id}
                      className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#bf0603]/30 transition-all">
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#bf0603] transition-all uppercase tracking-tighter">ID: {course.id.substring(0,4)}</span>
                        </div>
                        <div>
                          <span className="text-lg text-slate-900 font-bold tracking-tight group-hover:text-[#bf0603] transition-all uppercase">
                            {course.title || course.Title || "Untitled Course"}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{course.type} • {course.status || 'Active'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-6">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#b0a102] hover:text-white transition-all border-b border-transparent hover:border-[#b0a102]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.type)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#bf0603] hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {courses.length === 0 && (
                  <div className="py-20 text-center opacity-20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No courses found in records</p>
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
};

export default AddCourse;

