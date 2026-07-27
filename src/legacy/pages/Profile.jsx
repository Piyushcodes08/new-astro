import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseConfig";
import { updateProfile } from "firebase/auth";
import Aside from "./Aside";
import Footer from "../../components/sections/Footer/Footer";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "", fullName: "", fathersName: "", mothersName: "",
    dob: "", email: "", phone: "", birthPlace: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({ profilePic: userData.profilePic || "", fullName: userData.fullName || currentUser.displayName || "", fathersName: userData.fathersName || "", mothersName: userData.mothersName || "", dob: userData.dob || "", email: currentUser.email || "", phone: userData.phone || "", birthPlace: userData.birthPlace || "" });
        } else {
          setFormData({ profilePic: "", fullName: currentUser.displayName || "", fathersName: "", mothersName: "", dob: "", email: currentUser.email || "", phone: "", birthPlace: "" });
        }
        setLoading(false);
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [db]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        await setDoc(userDocRef, { ...formData, profilePic: imageUrl });
        await updateProfile(currentUser, { displayName: formData.fullName });
        alert("Profile updated successfully!");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };

  const handleRemovePic = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDocRef = doc(db, "students", currentUser.uid);
        await setDoc(userDocRef, { ...formData, profilePic: "" }, { merge: true });
        setFormData((prev) => ({ ...prev, profilePic: "" }));
        setImageFile(null);
        alert("Profile picture removed.");
      } catch (error) {
        console.error("Error removing profile picture:", error);
        alert("Failed to remove profile picture.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#e0d5c0] border-t-[#a07830] rounded-full animate-spin mx-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Loading...</p>
        </div>
      </div>
    );
  }

  const infoFields = [
    { label: "Full Name", value: formData.fullName || user?.displayName || "Not Provided" },
    { label: "Father's Name", value: formData.fathersName || "Not Provided" },
    { label: "Mother's Name", value: formData.mothersName || "Not Provided" },
    { label: "Date of Birth", value: formData.dob || "Not Provided" },
    { label: "Phone Number", value: formData.phone || "Not Provided" },
    { label: "Birth Place", value: formData.birthPlace || "Not Provided" },
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--dash-bg, #f8fafc)" }}>
      <div id="top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none -z-10" />
      <div className="flex flex-1 relative z-10 gap-0">
        <Aside />
        <main className="flex-1 min-w-0 py-6 pt-16 sm:pt-6 px-4 sm:px-6 lg:px-10 overflow-x-hidden">
          <div className="max-w-3xl mx-auto space-y-8 pb-12 pt-4">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[rgba(0,0,0,0.08)]">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-px w-7" style={{ background: "var(--dash-accent,#bf0603)" }} className="" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[var(--dash-accent,#bf0603)]">Account Settings</p>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1c1a17]">Student Profile</h1>
              </div>
              {!isEditing && user && (
                <button onClick={handleEdit}
                  className="inline-flex min-h-10 items-center gap-2 rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:-translate-y-0.5 hover:border-[rgba(212,175,104,0.7)] hover:bg-[rgba(212,175,104,0.08)]">
                  Edit Profile
                </button>
              )}
            </div>

            {user ? (
              <div className="rounded-xl border border-[#e0d5c0] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                {/* Top gold line */}
                <div className="h-px bg-gradient-to-r from-transparent via-[rgba(212,175,104,0.4)] to-transparent" />

                {isEditing ? (
                  /* ── Edit Form ── */
                  <form className="p-6 md:p-10 space-y-8">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center pb-8 border-b border-[rgba(0,0,0,0.08)]">
                      <div className="relative mb-4">
                        {/* Corner accents on avatar */}
                        <span className="absolute -top-1 -left-1 h-4 w-4 border-l-2 border-t-2 border-[rgba(212,175,104,0.5)]" />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 border-r-2 border-b-2 border-[rgba(212,175,104,0.5)]" />
                        <div className="w-28 h-28 overflow-hidden border-2 border-[rgba(212,175,104,0.3)] bg-white">
                          <img
                            src={imageFile ? URL.createObjectURL(imageFile) : (formData.profilePic || 'src/assets/images/common/logos/vahlay_astro logo.webp')}
                            alt="Profile Preview" className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded border border-[rgba(212,175,104,0.5)] bg-white text-[var(--dash-accent,#bf0603)] cursor-pointer hover:bg-[rgba(212,175,104,0.12)] transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[9px] font-bold text-[#b08840] uppercase tracking-widest mb-2">Update Photo</p>
                      {(formData.profilePic || imageFile) && (
                        <button type="button" onClick={handleRemovePic}
                          className="flex items-center gap-1.5 text-[9px] font-bold text-[rgba(255,100,100,0.7)] uppercase tracking-widest border border-[rgba(255,100,100,0.2)] px-4 py-1.5 rounded hover:border-[rgba(255,100,100,0.4)] hover:text-[rgba(255,100,100,0.9)] transition-all">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name" },
                        { label: "Father's Name", name: "fathersName", type: "text", placeholder: "" },
                        { label: "Mother's Name", name: "mothersName", type: "text", placeholder: "" },
                        { label: "Date of Birth", name: "dob", type: "date", placeholder: "" },
                        { label: "Phone Number", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                        { label: "Birth Place", name: "birthPlace", type: "text", placeholder: "City, State, Country" },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--dash-accent,#bf0603)]">{field.label}</label>
                          <input
                            type={field.type} name={field.name} value={formData[field.name]}
                            onChange={handleChange} placeholder={field.placeholder}
                            className="w-full bg-[#110f0d] border border-[rgba(212,175,104,0.2)] text-[#1c1a17] rounded px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.2)] focus:border-[rgba(212,175,104,0.6)] focus:outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[rgba(0,0,0,0.06)]">
                      <button type="button" onClick={handleSave}
                        className="inline-flex min-h-11 items-center justify-center rounded border border-[rgba(212,175,104,0.5)] bg-[rgba(255,255,255,0.025)] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:-translate-y-0.5 hover:bg-[rgba(212,175,104,0.1)]">
                        Save Profile
                      </button>
                      <button type="button" onClick={handleCancel}
                        className="inline-flex min-h-11 items-center justify-center rounded border border-white/10 bg-white/[0.03] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition hover:border-white/20 hover:text-white/80">
                        Discard
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── View Mode ── */
                  <div className="p-6 md:p-10">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-10">
                      <div className="relative mb-5">
                        <span className="absolute -top-1.5 -left-1.5 h-5 w-5 border-l-2 border-t-2 border-[rgba(212,175,104,0.5)]" />
                        <span className="absolute -bottom-1.5 -right-1.5 h-5 w-5 border-r-2 border-b-2 border-[rgba(212,175,104,0.5)]" />
                        <div className="w-28 h-28 overflow-hidden border-2 border-[rgba(212,175,104,0.3)] bg-white">
                          <img
                            src={formData.profilePic || 'src/assets/images/common/logos/vahlay_astro logo.webp'}
                            alt="Profile" className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/src/assets/images/common/logos/vahlay_astro logo.webp'; }}
                          />
                        </div>
                      </div>
                      <h3 className="font-serif text-xl text-[#1c1a17] mb-1">{formData.fullName || user.displayName || "Sacred Seeker"}</h3>
                      <p className="text-[9px] font-bold text-[#b08840] uppercase tracking-[0.3em]">{formData.email}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-8 border-t border-[rgba(0,0,0,0.06)]">
                      {infoFields.map((info, idx) => (
                        <div key={idx} className="relative rounded border border-[#e0d8cc] bg-white p-4 group hover:border-[rgba(212,175,104,0.28)] transition-colors">
                          <span className="block text-[8px] font-bold uppercase tracking-[0.25em] text-[#b08840] mb-1.5">{info.label}</span>
                          <p className="text-sm text-[#1c1a17] font-medium">{info.value}</p>
                        </div>
                      ))}
                      <div className="relative rounded border border-[#e0d8cc] bg-white p-4 sm:col-span-2 hover:border-[rgba(212,175,104,0.28)] transition-colors">
                        <span className="block text-[8px] font-bold uppercase tracking-[0.25em] text-[#b08840] mb-1.5">Email Address</span>
                        <p className="text-sm text-[#1c1a17] font-medium break-all">{formData.email || user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded border border-dashed border-[#d5c9b0] bg-white px-6 py-16 text-center">
                <p className="text-[#6b5a40] font-bold uppercase tracking-widest text-[9px] mb-6">Please log in to view your profile.</p>
                <Link to="/login" className="inline-flex min-h-10 items-center rounded border border-[rgba(212,175,104,0.4)] bg-[rgba(255,255,255,0.025)] px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0d99d] transition hover:bg-[rgba(212,175,104,0.1)]">
                  Secure Login
                </Link>
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
