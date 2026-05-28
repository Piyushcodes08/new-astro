import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useParams, Link } from "react-router-dom";
import Admin from "./Admin";
import Header from "../../components/sections/Header/Header";



// Custom dropdown component for course selection
const CourseDropdown = ({ courses, selectedCourse, setSelectedCourse }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTitle =
    courses.find((course) => course.id === selectedCourse)?.title || "Select a Course";

  return (
    <div className="relative mb-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-80 bg-gray-50 border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between group hover:bg-slate-100 transition-all text-slate-900 font-bold uppercase tracking-widest text-sm shadow-sm"
      >
        <span>{selectedTitle}</span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {isOpen && (
        <ul className="absolute mt-2 w-full md:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {courses.map((course) => (
            <li
              key={course.id}
              onClick={() => {
                setSelectedCourse(course.id);
                setIsOpen(false);
              }}
              className="px-6 py-4 cursor-pointer hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors border-b border-slate-100 last:border-0"
            >
              {course.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminVideoManager = () => {
  const { courseName } = useParams();
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));

        const allCourses = [
          ...paidSnapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title || d.id,
            type: "paid",
          })),
          ...freeSnapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title || d.id,
            type: "free",
          })),
        ];

        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosRef = collection(db, `videos_${selectedCourse}`);
        const snapshot = await getDocs(videosRef);
        const groupedVideos = {};

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const title = data.title || "Untitled";
          if (!groupedVideos[title]) {
            groupedVideos[title] = [];
          }
          groupedVideos[title].push({ id: doc.id, ...data });
        });

        // Sort videos within each title by order
        Object.keys(groupedVideos).forEach((title) => {
          groupedVideos[title].sort((a, b) => a.order - b.order);
        });

        setVideos(groupedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
      setLoading(false);
    };
    fetchVideos();
  }, [selectedCourse]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceTitle = source.droppableId;
    const destTitle = destination.droppableId;
    const movedVideo = videos[sourceTitle][source.index];

    // Create a copy of videos
    const updatedVideos = { ...videos };

    // Remove from source
    updatedVideos[sourceTitle] = updatedVideos[sourceTitle].filter((_, i) => i !== source.index);

    // Add to destination
    updatedVideos[destTitle] = [
      ...(updatedVideos[destTitle] || []).slice(0, destination.index),
      { ...movedVideo, title: destTitle },
      ...(updatedVideos[destTitle] || []).slice(destination.index),
    ];

    // Update local state
    setVideos(updatedVideos);

    // Track changes for saving later
    const changes = [];

    // Update orders for source title
    updatedVideos[sourceTitle].forEach((video, index) => {
      changes.push({
        id: video.id,
        updates: {
          order: index + 1,
          ...(sourceTitle !== video.title && { title: video.title }),
        },
      });
    });

    // Update orders for destination title
    updatedVideos[destTitle].forEach((video, index) => {
      changes.push({
        id: video.id,
        updates: {
          order: index + 1,
          title: destTitle,
        },
      });
    });

    setPendingChanges((prev) => [
      ...prev.filter((c) => !changes.some((newC) => newC.id === c.id)),
      ...changes,
    ]);
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    if (!pendingChanges.length) return;

    try {
      const batchUpdates = pendingChanges.map(({ id, updates }) =>
        updateDoc(doc(db, `videos_${selectedCourse}`, id), updates)
      );

      await Promise.all(batchUpdates);
      setPendingChanges([]);
      alert("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes.");
    }
  };

  // Delete video handler
  const handleDeleteVideo = async (videoId, title) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteDoc(doc(db, `videos_${selectedCourse}`, videoId));

      setVideos((prev) => ({
        ...prev,
        [title]: prev[title].filter((v) => v.id !== videoId),
      }));
    } catch (error) {
      console.error("Error deleting video:", error);
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
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Video <span className="text-[#dd2727]">Sequencing</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Drag and drop lessons to structure your course curriculum</p>
            </div>
            
            {pendingChanges.length > 0 && (
              <button
                onClick={handleSaveChanges}
                className="bg-[#dd2727] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all"
              >
                Save Changes ({pendingChanges.length})
              </button>
            )}
          </header>

          <CourseDropdown
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
          />

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64 animate-pulse"></div>
              ))}
            </div>
          ) : selectedCourse ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-8">
                {Object.keys(videos).length > 0 ? (
                  Object.keys(videos).map((title) => (
                    <div
                      key={title}
                      className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm"
                    >
                      <h3 className="text-lg font-bold text-[#b0a102] uppercase tracking-widest mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#b0a102] rounded-full"></div>
                        {title}
                      </h3>
                      
                      <Droppable droppableId={title}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {videos[title].map((video, index) => (
                              <Draggable key={video.id} draggableId={video.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="group"
                                  >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 border border-slate-100 p-5 rounded-xl group-hover:bg-slate-100 transition-all duration-300 gap-4">
                                      <div className="flex items-center gap-4 flex-1">
                                        <div {...provided.dragHandleProps} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#dd2727] transition-colors cursor-grab active:cursor-grabbing shadow-sm">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-900 tracking-wide">{video.description}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Order: {video.order + 1}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                          onClick={() => handleDeleteVideo(video.id, title)}
                                          className="flex-1 md:flex-none px-6 py-2 bg-slate-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase shadow-sm"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-gray-500 italic">No videos found for this course section.</p>
                  </div>
                )}
              </div>
            </DragDropContext>
          ) : (
            <div className="text-center py-20 bg-gray-50 border border-slate-100 rounded-2xl">
              <svg className="w-16 h-16 mx-auto mb-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <p className="text-slate-400 font-medium">Select a course to manage video sequence</p>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default AdminVideoManager;

