import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdminSidebar from "./Admin";
import Header from "../../components/sections/Header/Header";



const AdminTitleOrder = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [titleGroups, setTitleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch courses from both collections
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));
        
        const allCourses = [
          ...paidSnapshot.docs.map(d => d.id),
          ...freeSnapshot.docs.map(d => d.id)
        ].filter((v, i, a) => a.indexOf(v) === i);
        
        setCourses(allCourses.sort());
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch and group videos by title
  const fetchVideos = async (courseName) => {
    if (!courseName) {
      setTitleGroups([]);
      return;
    }
    setLoading(true);
    try {
      const videosRef = collection(db, `videos_${courseName}`);
      const snapshot = await getDocs(videosRef);
      
      const groups = new Map();
      snapshot.forEach(doc => {
        const data = doc.data();
        const title = data.title;
        
        if (!groups.has(title)) {
          groups.set(title, {
            title,
            order: data['title-order'] || 0,
            docRefs: []
          });
        }
        
        groups.get(title).docRefs.push(doc.ref);
      });

      const sortedGroups = Array.from(groups.values())
        .sort((a, b) => a.order - b.order);
      
      setTitleGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(titleGroups);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const orderedGroups = items.map((group, index) => ({
      ...group,
      order: index + 1
    }));
    
    setTitleGroups(orderedGroups);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      titleGroups.forEach(group => {
        group.docRefs.forEach(ref => {
          batch.update(ref, {
            'title-order': group.order
          });
        });
      });

      await batch.commit();
      alert("Title order saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <AdminSidebar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Title <span className="text-[#dd2727]">Arrangement</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Organize the sequence of modules for your courses</p>
            </div>
            
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                fetchVideos(e.target.value);
              }}
              className="w-full md:w-64 bg-gray-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select a Course</option>
              {courses.map(course => (
                <option key={course} value={course} className="bg-white">{course}</option>
              ))}
            </select>
          </header>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : selectedCourse ? (
            <div className="space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="titles">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm"
                    >
                      {titleGroups.length > 0 ? (
                        titleGroups.map((group, index) => (
                          <Draggable
                            key={group.title}
                            draggableId={group.title}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="group mb-3 last:mb-0"
                              >
                                <div className="flex items-center gap-4 p-5 bg-gray-50 border border-slate-100 rounded-2xl group-hover:bg-slate-100 transition-all duration-300">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#dd2727] cursor-grab active:cursor-grabbing transition-colors shadow-sm"
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 tracking-wide uppercase text-sm">
                                      {group.title}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                      {group.docRefs.length} Lessons within this title
                                    </p>
                                  </div>

                                  <div className="w-10 h-10 flex items-center justify-center bg-[#dd2727]/10 text-[#dd2727] rounded-full font-bold text-xs border border-[#dd2727]/20">
                                    {group.order}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500 italic">
                          No titles found for this course.
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {titleGroups.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={saveOrder}
                    disabled={saving}
                    className="bg-[#dd2727] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save New Sequence"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 border border-slate-100 rounded-2xl">
              <svg className="w-16 h-16 mx-auto mb-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 012-2M5 11V9a2 2 0 01-2-2m0 0V5a2 2 0 012-2h6.5L21 7v2"/></svg>
              <p className="text-slate-400 font-medium">Please select a course to arrange its modules</p>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTitleOrder;

