import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "../../firebaseConfig";
import SideBar from "./Admin";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { IoIosImages, IoIosTrash, IoIosAdd, IoIosClose, IoIosCloudUpload, IoIosCheckmarkCircle, IoIosWarning } from "react-icons/io";

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [preview, setPreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const fileInputRef = useRef();

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    image: null,
    imageUrl: "",
  });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "gallery"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort newest first
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setGallery(data);
    } catch (err) {
      showAlert("Failed to fetch gallery images.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert("Please select a valid image file.", "error");
      return;
    }
    setFormState((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormState({ title: "", description: "", image: null, imageUrl: "" });
    setPreview(null);
    setFormVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.image && !formState.imageUrl) {
      showAlert("Please select an image to upload.", "error");
      return;
    }
    if (!formState.title.trim()) {
      showAlert("Please enter a title for the image.", "error");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = formState.imageUrl;

      // Upload file to Firebase Storage if a file was selected
      if (formState.image) {
        const storageRef = ref(storage, `gallery/${Date.now()}_${formState.image.name}`);
        const snap = await uploadBytes(storageRef, formState.image);
        imageUrl = await getDownloadURL(snap.ref);
      }

      await addDoc(collection(db, "gallery"), {
        title: formState.title.trim(),
        description: formState.description.trim(),
        image: imageUrl,
        storagePath: formState.image
          ? `gallery/${Date.now()}_${formState.image.name}`
          : null,
        createdAt: serverTimestamp(),
      });

      showAlert("Image added to gallery successfully!", "success");
      resetForm();
      fetchGallery();
    } catch (err) {
      console.error(err);
      showAlert("Failed to upload image. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from gallery?`)) return;
    setIsDeleting(item.id);
    try {
      // Try to delete from storage if storagePath exists
      if (item.storagePath) {
        try {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef);
        } catch (_) {
          // Ignore storage errors (file may not exist)
        }
      }
      await deleteDoc(doc(db, "gallery", item.id));
      showAlert("Image deleted successfully.", "success");
      setGallery((prev) => prev.filter((g) => g.id !== item.id));
    } catch (err) {
      showAlert("Failed to delete image.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030106]">
      <Header />
      <div className="flex">
        <SideBar />

        <main className="flex-1 p-6 lg:p-8 lg:pt-24 min-h-screen">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <IoIosImages className="text-brand-red" size={28} />
                Gallery Management
              </h1>
              <p className="text-white/40 text-sm mt-1 font-medium">
                Upload and manage spiritual gallery images
              </p>
            </div>
            <button
              onClick={() => setFormVisible(true)}
              className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 active:scale-95"
            >
              <IoIosAdd size={20} />
              Add Image
            </button>
          </div>

          {/* Alert */}
          {alert.message && (
            <div
              className={`mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm border ${
                alert.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {alert.type === "success" ? (
                <IoIosCheckmarkCircle size={20} />
              ) : (
                <IoIosWarning size={20} />
              )}
              {alert.message}
            </div>
          )}

          {/* Upload Form Modal */}
          {formVisible && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
              <div className="bg-[#0e0a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Form Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h2 className="text-white font-black text-lg tracking-tight">
                    Add Gallery Image
                  </h2>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                  >
                    <IoIosClose size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                      Image *
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-white/20 hover:border-brand-red/50 rounded-xl cursor-pointer transition-all group overflow-hidden"
                      style={{ minHeight: "180px" }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30 group-hover:text-white/60 transition-all">
                          <IoIosCloudUpload size={40} />
                          <p className="text-sm font-semibold">
                            Click to upload image
                          </p>
                          <p className="text-xs">PNG, JPG, WEBP supported</p>
                        </div>
                      )}
                      {preview && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                          <p className="text-white font-bold text-sm">
                            Click to change image
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Or use URL */}
                  {!formState.image && (
                    <div>
                      <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                        Or Image URL
                      </label>
                      <input
                        type="url"
                        value={formState.imageUrl}
                        onChange={(e) =>
                          setFormState((p) => ({
                            ...p,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-red/50 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="e.g. Sacred Ritual Ceremony"
                      className="w-full bg-white/5 border border-white/10 focus:border-brand-red/50 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      value={formState.description}
                      onChange={(e) =>
                        setFormState((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this image..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 focus:border-brand-red/50 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold text-sm uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-xl bg-brand-red text-white font-black text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <IoIosCloudUpload size={16} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lightbox */}
          {lightbox && (
            <div
              className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[4000] flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all z-10"
                onClick={() => setLightbox(null)}
              >
                <IoIosClose size={24} />
              </button>
              <div
                className="max-w-3xl w-full bg-[#0e0a1a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightbox.image}
                  alt={lightbox.title}
                  className="w-full max-h-[60vh] object-cover"
                />
                <div className="p-6">
                  <h3 className="text-white text-xl font-black mb-2">
                    {lightbox.title}
                  </h3>
                  {lightbox.description && (
                    <p className="text-white/50 text-sm leading-relaxed">
                      {lightbox.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-red/20 rounded-xl flex items-center justify-center">
                <IoIosImages className="text-brand-red" size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{gallery.length}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
                  Total Images
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/20">
              <IoIosImages size={60} />
              <p className="font-bold text-lg">No images in gallery yet.</p>
              <button
                onClick={() => setFormVisible(true)}
                className="text-brand-red font-bold text-sm uppercase tracking-widest hover:underline"
              >
                + Add your first image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  {/* Image */}
                  <div
                    className="relative h-48 cursor-pointer overflow-hidden"
                    onClick={() => setLightbox(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-white text-xs font-bold">
                        Click to preview
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm truncate mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting === item.id}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-500 border border-white/10 hover:border-red-500 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-200"
                    title="Delete image"
                  >
                    {isDeleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <IoIosTrash size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminGallery;
