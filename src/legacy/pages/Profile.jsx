import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseConfig"; // Firebase configuration file
import { updateProfile } from "firebase/auth";

import Aside from "./Aside";
import Header from "../../components/sections/Header/Header";
import Footer from "../../components/sections/Footer/Footer";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
    email: "NA",
  });
  const [imageFile, setImageFile] = useState(null); // State for uploaded image
  const [loading, setLoading] = useState(true); // Loading state to prevent flickering
  const db = getFirestore(app);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);

      // Fetch user profile from Firestore
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            fathersName: userData.fathersName || "NA",
            mothersName: userData.mothersName || "NA",
            dob: userData.dob || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          // If user profile doesn't exist, set default values
          setFormData({
            profilePic: "",
            fullName: "NA",
            fathersName: "NA",
            mothersName: "NA",
            dob: "NA",
            email: currentUser.email || "NA",
          });
        }

        setLoading(false); // Set loading to false once the profile is fetched
      };

      fetchProfile();
    } else {
      setLoading(false); // In case no user is logged in, stop loading
    }
  }, [db]); // Dependency array ensures it only runs once on mount

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleSave = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        let imageUrl = formData.profilePic;

        if (imageFile) {
          const storage = getStorage();
          const storageRef = ref(storage, `profile-pics/${currentUser.uid}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        }

        const userDocRef = doc(db, "students", currentUser.uid);
        await setDoc(userDocRef, {
          ...formData,
          profilePic: imageUrl,
        });

        // 🔁 Also update Firebase Auth display name
        await updateProfile(currentUser, {
          displayName: formData.fullName,
        });

        alert("Profile updated successfully!");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center py-10 px-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium tracking-wider animate-pulse">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout min-h-screen flex flex-col bg-slate-50">
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <Header />

      <div className="flex flex-1 relative z-10 pt-16 gap-0">
        <Aside />

        <main className="flex-1 min-w-0 py-6 px-[15px] md:px-[50px] bg-white overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-10 pt-6">

            {/* Page Header - Responsive Scaling */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 pb-8 md:pb-12 pt-6">
              <div>
                <h4 className="text-brand-red font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-1 md:mb-2">Account Settings</h4>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                  Student <span className="text-brand-red">Profile</span>
                </h1>
              </div>
              {!isEditing && user && (
                <button
                  onClick={handleEdit}
                  className="w-full sm:w-auto bg-brand-red text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {user ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {isEditing ? (
                  <form className="p-5 md:p-10 space-y-8">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center pb-8 border-b border-slate-50">
                      <div className="relative group mb-4">
                        <div className="absolute -inset-1 bg-slate-200 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : (formData.profilePic || '/src/assets/images/common/logos/vahlay_astro.png')}
                          alt="Profile Preview"
                          className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl bg-slate-50"
                        />
                        <label className="absolute bottom-0 right-0 bg-brand-red text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <input
                            type="file"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 font-medium focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Father's Name</label>
                        <input
                          type="text"
                          name="fathersName"
                          value={formData.fathersName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 font-medium focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mother's Name</label>
                        <input
                          type="text"
                          name="mothersName"
                          value={formData.mothersName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 font-medium focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob !== "NA" ? formData.dob : ""}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 font-medium focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="w-full sm:w-auto bg-brand-red text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all hover:-translate-y-0.5"
                      >
                        Save Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto bg-slate-100 text-slate-600 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 md:p-12">
                    <div className="flex flex-col items-center mb-10">
                      <div className="relative group mb-6">
                        <div className="absolute -inset-2 bg-linear-to-r from-brand-red to-[#f43f5e] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <img
                          src={formData.profilePic || '/src/assets/images/common/logos/vahlay_astro.png'}
                          alt="Profile"
                          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-2xl bg-slate-50"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/src/assets/images/common/logos/vahlay_astro.png"; }}
                        />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{formData.fullName}</h3>
                      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{formData.email}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-10">
                      {[
                        { label: "Full Name", value: formData.fullName },
                        { label: "Father's Name", value: formData.fathersName },
                        { label: "Mother's Name", value: formData.mothersName },
                        { label: "Date of Birth", value: formData.dob }
                      ].map((info, idx) => (
                        <div key={idx} className="space-y-1.5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{info.label}</span>
                          <p className="text-slate-800 font-bold tracking-tight text-sm md:text-base">{info.value}</p>
                        </div>
                      ))}
                      <div className="space-y-1.5 p-5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                        <p className="text-slate-800 font-bold tracking-tight break-all text-sm md:text-base">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 md:p-20 text-center border border-slate-100 shadow-sm">
                <div className="text-4xl mb-6">🔒</div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">Please log in to view your sacred profile.</p>
                <Link to="/login" className="bg-brand-red text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all">Secure Login</Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;


