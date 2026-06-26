import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const slugify = (text) =>
  text?.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");


const AdminArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [formState, setFormState] = useState({
    title: "",
    hindi: "",
    author: "",
    rawDate: "",
    data: "",
    dhindi: "",
    denglish: "",
    referenceLink: "",
    image: null,
    imageUrl: "",
    sTitle: "",
    sDesc: "",
    sKeywords: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Articles"));
      const articlesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by date (latest first)
      articlesData.sort((a, b) => {
        const dateA = new Date(a.createdAt?.seconds * 1000 || a.rawDate || a.data || 0);
        const dateB = new Date(b.createdAt?.seconds * 1000 || b.rawDate || b.data || 0);
        return dateB - dateA;
      });

      setArticles(articlesData);
    } catch (error) {
      console.error("Error fetching articles:", error);
      showAlert("Failed to load articles.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormState({ ...formState, image: e.target.files[0] });
  };

  const handleSaveArticle = async () => {
    const { title, author, type, rawDate, data, denglish, dhindi, description, referenceLink, image, imageUrl, sTitle, sDesc, sKeywords, hindi } = formState;

    if (!title || !author) {
      showAlert("Please fill in Title and Author.", "error");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = imageUrl;

      if (image) {
        const imageRef = ref(storage, `AstroArticles/${image.name}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      // Format date: use rawDate if provided, otherwise use current date
      let dateObj = rawDate ? new Date(rawDate) : new Date();
      const options = { month: "long", day: "numeric", year: "numeric" };
      let formattedDate = dateObj.toLocaleDateString("en-US", options);

      // Handle keywords as array
      const keywordArray = typeof sKeywords === 'string'
        ? sKeywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0)
        : sKeywords || [];

      const articleData = {
        title,
        hindi,
        author,
        data: formattedDate,
        rawDate: rawDate || "",
        dhindi,
        denglish,
        referenceLink,
        imageUrl: finalImageUrl,
        sTitle,
        sDesc,
        sKeywords: keywordArray,
      };

      if (editMode) {
        await updateDoc(doc(db, "Articles", currentArticleId), articleData);
        showAlert("Article updated successfully!", "success");
      } else {
        await addDoc(collection(db, "Articles"), { ...articleData, createdAt: serverTimestamp() });
        showAlert("Article created successfully!", "success");
      }

      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      showAlert("Failed to save article.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "Articles", id));
      showAlert("Article deleted successfully!", "success");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      showAlert("Failed to delete article.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormState({
      title: "",
      hindi: "",
      author: "",
      rawDate: "",
      data: "",
      dhindi: "",
      denglish: "",
      referenceLink: "",
      image: null,
      imageUrl: "",
      sTitle: "",
      sDesc: "",
      sKeywords: "",
    });
    setEditMode(false);
    setCurrentArticleId(null);
    setFormVisible(false);
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 3000);
  };

  return (
    <div className="admin-layout flex flex-col min-h-screen">
      <Header />

      {/* Main Wrapper using Sticky Sidebar Logic */}
      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <SideBar />

        <main className="flex-1 min-w-0 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-12">
            <div className="flex justify-between items-center pt-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Manage <span className="text-brand-red">Articles</span>
              </h2>
              <button
                onClick={() => { resetForm(); setFormVisible(true); }}
                className="bg-brand-red text-white px-3 text-xs py-2 rounded-2xl uppercase  tracking-widest hover:shadow-[0_0_30px_rgba(191, 6, 3,0.5)] transition-all"
              >
                {formVisible ? "X" : "add new"}
              </button>
            </div>

            {alertMessage && (
              <div className={`p-5 rounded-3xl text-center text-[10px] font-bold uppercase tracking-[0.2em] animate-in fade-in border ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {alertMessage}
              </div>
            )}

            {formVisible && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-slate-900 mb-8 pb-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-brand-red rounded-full"></div>
                  {editMode ? "Edit Article" : "Create New Article"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input type="text" name="title" value={formState.title} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none transition-all placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Hindi Title</label>
                    <input type="text" name="hindi" value={formState.hindi} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Author</label>
                    <input type="text" name="author" value={formState.author} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Publish Date</label>
                    <input type="date" name="rawDate" value={formState.rawDate} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Featured Image</label>
                    <input type="file" onChange={handleFileChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Reference Video Link</label>
                    <input type="url" name="referenceLink" value={formState.referenceLink} onChange={handleInputChange} placeholder="https://youtube.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none placeholder:text-gray-300" />
                  </div>

                  {/* Article Content Section */}
                  <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-gray-100 mt-4">
                    <h4 className="text-xs font-black text-brand-red uppercase tracking-[0.2em] mb-2">Article Content</h4>
                    <p className="text-[10px] text-slate-400 font-medium">This is the body text displayed on the article detail page.</p>
                  </div>


                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">English Body (denglish)</label>
                    <textarea name="denglish" value={formState.denglish} onChange={handleInputChange} placeholder="Full article content in English..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none h-48 resize-none placeholder:text-gray-300" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Hindi Body (dhindi)</label>
                    <textarea name="dhindi" value={formState.dhindi} onChange={handleInputChange} placeholder="पूर्ण लेख सामग्री हिंदी में..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none h-48 resize-none placeholder:text-gray-300" />
                  </div>

                  {/* SEO Section */}
                  <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-gray-100 mt-4">
                    <h4 className="text-xs font-black text-[#b0a102] uppercase tracking-[0.2em] mb-8">Search Engine Optimization</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">SEO Title</label>
                    <input type="text" name="sTitle" value={formState.sTitle} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">SEO Description</label>
                    <textarea name="sDesc" value={formState.sDesc} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-brand-red outline-none h-24 resize-none"></textarea>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">SEO Keywords</label>
                    <textarea name="sKeywords" value={formState.sKeywords} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 focus:ring-2 focus:ring-brand-red outline-none h-20 resize-none"></textarea>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
                  <button onClick={handleSaveArticle} disabled={isSaving} className="flex-1 bg-brand-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50">
                    {isSaving ? "Publishing..." : editMode ? "Save Changes" : "Publish Article"}
                  </button>
                  <button onClick={resetForm} className="px-10 py-4 bg-slate-100 border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                Article Library
                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">{articles.length} total</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 animate-pulse">
                      <div className="w-full aspect-video bg-gray-200"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : articles.length === 0 ? (
                  <div className="col-span-3 text-center py-20 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-slate-400 font-medium italic">No articles found in the library.</p>
                  </div>
                ) : articles.map((article) => (
                  <div key={article.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-red/40 transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl relative">

                    {/* 16:9 Article Image */}
                    <div className="relative w-full aspect-video overflow-hidden bg-slate-50">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      {(article.data || article.createdAt) && (
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                          {article.data || (article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-red transition-colors line-clamp-2 leading-snug">{article.title}</h4>
                        {article.hindi && <p className="text-xs text-slate-500 font-medium line-clamp-1">{article.hindi}</p>}
                      </div>
                      <div className="flex gap-3 mt-auto pt-4 border-t border-slate-50">
                        <button
                          onClick={() => {
                            setEditMode(true);
                            setCurrentArticleId(article.id);
                            // Convert keywords array back to string for the textarea
                            const keywordsString = Array.isArray(article.sKeywords) 
                              ? article.sKeywords.join(", ") 
                              : article.sKeywords || "";
                            
                            setFormState({ 
                              ...article, 
                              sKeywords: keywordsString,
                              image: null 
                            });
                            setFormVisible(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex-1 bg-brand-red border border-slate-100 py-1 rounded-xl text-xs font-semibold uppercase tracking-widest text-white hover:bg-slate-50 hover:text-brand-red transition-all"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteArticle(article.id)} disabled={isDeleting} className="px-5 py-3 bg-brand-red text-white border border-red-100 rounded-xl hover:bg-white hover:text-brand-red transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminArticles;

