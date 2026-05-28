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
  const [imageFile, setImageFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
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

  const handleAddOrUpdateProduct = async () => {
    if (!title || !desc || !price || (!imageFile && !editingProductId)) {
      alert("Title, description, price, and image are required");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = null;

      if (imageFile) {
        const imageRef = ref(storage, `product-images/${title}_${Date.now()}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productData = {
        title,
        desc,
        price,
        oldPrice,
        theme,
        image: imageUrl || (products.find((p) => p.id === editingProductId)?.image || ""),
      };

      if (!editingProductId) {
        productData.createdAt = serverTimestamp();
      }

      // Use a custom ID or let Firebase generate one if not editing. 
      // For simplicity, we use title as doc ID if creating new, matching AddCourse behavior.
      const docId = editingProductId || title.replace(/\s+/g, '-').toLowerCase();
      const productDocRef = doc(db, "products", docId);
      await setDoc(productDocRef, productData, { merge: true });

      alert(editingProductId ? "Product updated successfully" : "Product added successfully");
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
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setPrice("");
    setOldPrice("");
    setTheme("gold");
    setImageFile(null);
    setEditingProductId(null);
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
                Product <span className="text-[#dd2727]">Management</span>
              </h2>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="bg-[#dd2727] text-white px-3 text-xs py-2 rounded-2xl uppercase tracking-widest hover:shadow-[0_0_30px_rgba(221,39,39,0.5)] transition-all"
              >
                {isFormVisible ? "X" : "add new product"}
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#dd2727]/5 rounded-full blur-[100px]"></div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-12 pb-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#dd2727] rounded-full"></div>
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Title</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Pyrite Bracelet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. ₹999"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Old Price (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all placeholder:text-gray-400"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="e.g. ₹1499"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Card Theme</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#dd2727] outline-none appearance-none cursor-pointer"
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

                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 h-32 focus:ring-2 focus:ring-[#dd2727] outline-none transition-all resize-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Enter product description"
                  ></textarea>
                </div>

                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Image</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center group/upload hover:border-[#dd2727]/50 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                    <div className="space-y-3">
                      <svg className="w-10 h-10 text-gray-600 mx-auto group-hover/upload:text-[#dd2727] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <p className="text-sm font-medium text-gray-400">{imageFile ? imageFile.name : "Select Product Image"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <button
                    onClick={handleAddOrUpdateProduct}
                    className={`w-full bg-[#dd2727] text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(221,39,39,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading Data..." : editingProductId ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#b0a102] rounded-full"></span>
                  Product Inventory ({products.length})
                </div>
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 group-hover:border-[#dd2727]/30 transition-all">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-lg text-slate-900 font-bold tracking-tight group-hover:text-[#dd2727] transition-all uppercase">
                            {product.title}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Theme: {product.theme} • {product.price}</p>
                        </div>
                      </div>
                      <div className="flex space-x-6">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#b0a102] hover:text-white transition-all border-b border-transparent hover:border-[#b0a102]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#dd2727] hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
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
