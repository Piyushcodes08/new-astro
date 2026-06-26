import React, { useState, useEffect } from "react";
import SideBar from "./Admin";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [theme, setTheme] = useState("gold");
  // Multiple image files
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingExistingImages, setEditingExistingImages] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const storage = getStorage();

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const allProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle multiple image file selection with previews
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 images
    const selected = files.slice(0, 5);
    setImageFiles(selected);

    // Generate previews
    const previews = selected.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove a selected image from list
  const removeSelectedImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove an existing image when editing
  const removeExistingImage = (index) => {
    setEditingExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddOrUpdateProduct = async () => {
    if (!title || !desc || !price) {
      alert("Title, description, and price are required.");
      return;
    }

    const hasNewImages = imageFiles.length > 0;
    const hasExistingImages = editingExistingImages.length > 0;

    if (!editingProductId && !hasNewImages) {
      alert("Please upload at least one product image.");
      return;
    }

    try {
      setIsUploading(true);
      let uploadedUrls = [];

      // Upload all new images
      if (hasNewImages) {
        const uploadPromises = imageFiles.map(async (file) => {
          const imageRef = ref(storage, `product-images/${title}_${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        });
        uploadedUrls = await Promise.all(uploadPromises);
      }

      // Combine existing images (when editing) + newly uploaded
      const finalImages = [...editingExistingImages, ...uploadedUrls];

      if (finalImages.length === 0) {
        alert("Please upload at least one product image.");
        setIsUploading(false);
        return;
      }

      const productData = {
        title,
        desc,
        price,
        oldPrice,
        theme,
        image: finalImages[0],       // Primary image (backward compat)
        images: finalImages,          // Full images array for gallery
      };

      if (!editingProductId) {
        productData.createdAt = serverTimestamp();
      }

      const docId = editingProductId || title.replace(/\s+/g, '-').toLowerCase();
      const productDocRef = doc(db, "products", docId);
      await setDoc(productDocRef, productData, { merge: true });

      alert(editingProductId ? "Product updated successfully!" : "Product added successfully!");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      alert("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleEditProduct = (product) => {
    setTitle(product.title);
    setDesc(product.desc);
    setPrice(product.price);
    setOldPrice(product.oldPrice || "");
    setTheme(product.theme || "gold");
    setEditingProductId(product.id);
    // Load existing images (support both single image and array)
    const existingImgs = product.images && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];
    setEditingExistingImages(existingImgs);
    setImageFiles([]);
    setImagePreviews([]);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setPrice("");
    setOldPrice("");
    setTheme("gold");
    setImageFiles([]);
    setImagePreviews([]);
    setEditingExistingImages([]);
    setEditingProductId(null);
    setIsFormVisible(false);
  };

  return (
    <div className="admin-layout">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-150x pointer-events-none z-[-1]" />
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen pt-16 relative z-10 admin-fluid-container gap-0 pb-0">
        <SideBar />

        <main className="flex-1 min-w-150 py-10 px-[15px] md:px-[50px] bg-white">
          <div className="space-y-8">
            <div className="flex justify-between items-center pt-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Product <span className="text-[#bf0603]">Management</span>
              </h2>
              <button
                onClick={() => { setIsFormVisible(!isFormVisible); if (isFormVisible) resetForm(); }}
                className="bg-[#bf0603] text-white px-3 text-xs py-2 rounded-3xlxl uppercase tracking-widest hover:shadow-[0_0_30px_rgba(191, 6, 3,0.5)] transition-all"
              >
                {isFormVisible ? "✕ Cancel" : "+ Add New Product"}
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white border border-slate-200 rounded-3xlxl p-8 md:p-10 shadow-150l shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#bf0603]/5 rounded-full blur-[100px]"></div>

               

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Title *</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-3xlxl px-6 py-4 text-gray-900 focus:ring-brand-red focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Pyrite Bracelet"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price *</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-3xlxl px-6 py-4 text-gray-900 focus:ring-brand-red focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. ₹999"
                    />
                  </div>

                  {/* Old Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Old Price (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-3xlxl px-6 py-4 text-gray-900 focus:ring-brand-red focus:ring-[#bf0603] outline-none transition-all placeholder:text-gray-400"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="e.g. ₹1499"
                    />
                  </div>

                  {/* Theme */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Card Theme</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-3xlxl px-6 py-4 text-gray-900 focus:ring-brand-red focus:ring-[#bf0603] outline-none appearance-none cursor-pointer"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="gold">Gold</option>
                      <option value="purple">Purple</option>
                      <option value="cyan">Cyan</option>
                      <option value="green">Green</option>
                      <option value="orange">Orange</option>
                      <option value="pink">Pink</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description *</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-3xlxl px-6 py-4 text-gray-900 h-32 focus:ring-brand-red focus:ring-[#bf0603] outline-none transition-all resize-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Enter product description..."
                  ></textarea>
                </div>

                {/* Multiple Images Upload */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Product Images * <span className="text-gray-400 normal-case">(up to 5 images)</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {imageFiles.length > 0 ? `${imageFiles.length} new selected` : ""}
                    </span>
                  </div>

                  {/* Existing Images (when editing) */}
                  {editingExistingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Images</p>
                      <div className="flex flex-wrap gap-3">
                        {editingExistingImages.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Existing ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-3xlxll border border-gray-200"
                            />
                            <button
                              onClick={() => removeExistingImage(idx)}
                              className="absolute -top-2 -right-2 w-150 h-150 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remove this image"
                            >
                              ✕
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-3.75 rounded font-bold">MAIN</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">New Images to Upload</p>
                      <div className="flex flex-wrap gap-3">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-3xlxll border-brand-red border-[#bf0603]/30"
                            />
                            <button
                              onClick={() => removeSelectedImage(idx)}
                              className="absolute -top-2 -right-2 w-150 h-150 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remove"
                            >
                              ✕
                            </button>
                            {(idx === 0 && editingExistingImages.length === 0) && (
                              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-3.75 rounded font-bold">MAIN</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="bg-gray-50 border-brand-red border-brand-redashed border-gray-200 rounded-3xlxl p-8 text-center group/upload hover:border-[#bf0603]/50 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleImageChange}
                    />
                    <div className="space-y-3 pointer-events-none">
                      <svg className="w-10 h-10 text-gray-400 mx-auto group-hover/upload:text-[#bf0603] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 group-hover/upload:text-[#bf0603] transition-colors">
                          Click to upload images
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each • Max 5 images</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-10">
                  <button
                    onClick={handleAddOrUpdateProduct}
                    className={`w-full bg-[#bf0603] text-white py-5 rounded-3xlxll font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(191, 6, 3,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isUploading}
                  >
                    {isUploading
                      ? `Uploading... please wait`
                      : editingProductId
                        ? "Update Product"
                        : "Add Product"}
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-8">
              {/* <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-150 bg-[#b0a102] rounded-full"></span>
                  Product Inventory ({products.length})
                </div>
              </h3> */}
              <div className="bg-white border border-slate-200 rounded-3xlxl overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const imgCount = product.images ? product.images.length : (product.image ? 1 : 0);
                    return (
                      <li
                        key={product.id}
                        className="p-6 flex justify-between items-center hover:bg-size-[72px_72px]late-50 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          {/* Image Grid Preview */}
                          <div className="w-16 h-16 rounded-3xlxll bg-size-[72px_72px]late-50 overflow-hidden border border-slate-100 group-hover:border-[#bf0603]/30 transition-all shrink-0">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-lg text-slate-900 font-bold tracking-tight group-hover:text-[#bf0603] transition-all uppercase">
                              {product.title}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              Theme: {product.theme} • {product.price}
                              {imgCount > 1 && (
                                <span className="ml-2 text-[#bf0603]">• {imgCount} images</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#b0a102] hover:text-[#b0a102]/80 transition-all border-b border-transparent hover:border-[#b0a102]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#bf0603] hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {products.length === 0 && (
                  <div className="py-20 text-center opacity-20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No products found in inventory</p>
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

export default AddProduct;
