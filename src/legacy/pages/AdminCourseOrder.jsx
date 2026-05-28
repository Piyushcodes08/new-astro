import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AdminTitleOrder = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all course names (collection IDs)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        
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

  // Fetch titles with current order
  const fetchTitles = async (courseName) => {
    if (!courseName) {
      setTitles([]);
      return;
    }
    setLoading(true);
    try {
      const videosRef = collection(db, `videos_${courseName}`);
      const snapshot = await getDocs(videosRef);
      
      const titleMap = new Map();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title) {
          titleMap.set(data.title, {
            id: doc.id,
            title: data.title,
            order: data['title-order'] || 0,
            docRef: doc.ref
          });
        }
      });

      const sortedTitles = Array.from(titleMap.values())
        .sort((a, b) => a.order - b.order);
      
      setTitles(sortedTitles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Drag & Drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(titles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const orderedTitles = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setTitles(orderedTitles);
  };

  // Save Updated Order to Firestore
  const saveOrder = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      titles.forEach(title => {
        batch.update(title.docRef, {
          'title-order': title.order
        });
      });

      await batch.commit();
      alert("Sequence saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save sequence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Course <span className="text-brand-red">Hierarchy</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Define the logical flow of your curriculum</p>
              </div>
              
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchTitles(e.target.value);
                }}
                className="w-full md:w-64 bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="">Select a Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </header>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : selectedCourse ? (
              <div className="space-y-6">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="titles">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                      >
                        {titles.length > 0 ? (
                          titles.map((title, index) => (
                            <Draggable
                              key={title.title}
                              draggableId={title.title}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="group mb-3 last:mb-0"
                                >
                                  <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-white group-hover:border-brand-red/30 transition-all duration-300">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="p-2 bg-white rounded-lg text-slate-400 hover:text-brand-red cursor-grab active:cursor-grabbing border border-slate-200 transition-colors shadow-sm"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
                                    </div>
                                    
                                    <div className="flex-1">
                                      <h3 className="font-bold text-slate-900 tracking-tight text-sm">
                                        {title.title}
                                      </h3>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        Module ID: {title.id.substring(0, 8)}...
                                      </p>
                                    </div>

                                    <div className="w-10 h-10 flex items-center justify-center bg-[#b0a102]/10 text-[#b0a102] rounded-full font-bold text-xs border border-[#b0a102]/20">
                                      {title.order}
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

                {titles.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={saveOrder}
                      disabled={saving}
                      className="bg-brand-red text-white px-10 py-4 rounded-xl font-extrabold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/20 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      {saving ? "Saving Changes..." : "Apply Sequence"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <svg className="w-16 h-16 mx-auto mb-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <p className="text-slate-400 font-medium italic">Please select a course to organize hierarchy</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminTitleOrder;

