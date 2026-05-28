import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Button from '../../ui/Button/Button';
import ReCAPTCHA from "react-google-recaptcha";
import './AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('BOOKING'); // BOOKING
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [availableData, setAvailableData] = useState([]);
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);

    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "male",
        day: "",
        month: "",
        year: "",
        hour: "",
        minute: "",
        period: "AM",
        birthPlace: "",
        phone: "",
        email: "",
        availableDate: "",
        slot: "",
        details: ""
    });

    // Reset view when modal opens
    useEffect(() => {
        if (isOpen) {
            setView('BOOKING');
            setIsMounted(true);
            document.body.style.overflow = 'hidden';
            fetchAvailableData();
        } else {
            const timer = setTimeout(() => setIsMounted(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchAvailableData = async () => {
        try {
            const calendarSnapshot = await getDocs(collection(db, "Calendar"));
            const groupedData = calendarSnapshot.docs.reduce((acc, doc) => {
                const data = doc.data();
                acc[data.date] = acc[data.date] || [];
                acc[data.date].push(data.timeSlot);
                return acc;
            }, {});
            const availableDataList = Object.entries(groupedData).map(([date, timeSlots]) => ({
                date,
                timeSlot: timeSlots,
            }));
            setAvailableData(availableDataList);
        } catch (error) {
            console.error("Error fetching calendar data:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!captchaToken) {
            alert("Please verify that you are not a robot.");
            return;
        }

        setIsLoading(true);

        try {
            const formEndpoint = "https://api.web3forms.com/submit";
            const accessKey = "afc0705d-3423-48a7-a14d-e83d4ffd11e0";

            const data = {
                access_key: accessKey,
                ...formData,
                dob: `${formData.day}-${formData.month}-${formData.year}`,
                birthTime: `${formData.hour}:${formData.minute} ${formData.period}`,
                captchaVerified: true
            };

            const response = await fetch(formEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Appointment scheduled successfully! Our astrologer will contact you soon.");
                setCaptchaToken(null);
                if (recaptchaRef.current) recaptchaRef.current.reset();
                onClose();
            } else {
                throw new Error("Failed to submit the form.");
            }
        } catch (error) {
            console.error("Error submitting appointment:", error);
            alert("Failed to book appointment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthRedirect = (type) => {
        setView('BOOKING');
    };

    if (!isMounted && !isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
            <div 
                className={`modal-container ${isOpen ? 'show' : ''} view-${view}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-accent-line"></div>

                {view === 'CHOICE' && (
                    <div className="view-content animate-in">
                        <div className="modal-header auth-header">
                            <div className="title-group">
                                <span className="modal-label">Welcome to Vahlay Astro</span>
                                <h2>Identify Yourself</h2>
                            </div>
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                        <div className="choice-grid">
                            <div className="choice-card" onClick={() => handleAuthRedirect('SIGNUP')}>
                                <div className="choice-icon">✦</div>
                                <h3>New User</h3>
                                <p>Start your journey with a new account</p>
                                <span className="choice-action">Create Account</span>
                            </div>
                            <div className="choice-card" onClick={() => handleAuthRedirect('LOGIN')}>
                                <div className="choice-icon">⚡</div>
                                <h3>Old User</h3>
                                <p>Welcome back! Access your profile</p>
                                <span className="choice-action">Login</span>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'BOOKING' && (
                    <div className="view-content animate-in scrollable-view">
                        <div className="modal-header">
                            <div className="title-group">
                                <span className="modal-label">Personal & Birth Details</span>
                                <h2>Book an Appointment</h2>
                            </div>
                            <button className="close-btn" onClick={onClose}>&times;</button>
                        </div>
                        <form className="appointment-form" onSubmit={handleSubmit}>
                            
                            <div className="form-section">
                                <h4 className="section-title">Personal Details</h4>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter your first name" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter your last name" required />
                                    </div>
                                </div>

                                <div className="input-group mt-15">
                                    <label>Gender</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} />
                                            <span>Male</span>
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} />
                                            <span>Female</span>
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleInputChange} />
                                            <span>Other</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-grid-three mt-15">
                                    <div className="input-group">
                                        <label>Day</label>
                                        <input type="number" name="day" value={formData.day} onChange={handleInputChange} placeholder="DD" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Month</label>
                                        <input type="number" name="month" value={formData.month} onChange={handleInputChange} placeholder="MM" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Year</label>
                                        <input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="YYYY" required />
                                    </div>
                                </div>

                                <div className="form-grid-three mt-15">
                                    <div className="input-group">
                                        <label>Hour</label>
                                        <input type="number" name="hour" value={formData.hour} onChange={handleInputChange} placeholder="HH" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Minute</label>
                                        <input type="number" name="minute" value={formData.minute} onChange={handleInputChange} placeholder="MM" required />
                                    </div>
                                    <div className="input-group">
                                        <label>AM/PM</label>
                                        <select name="period" value={formData.period} onChange={handleInputChange} required>
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group full-width mt-15">
                                    <label>Birth Place</label>
                                    <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} placeholder="Enter your birth place" required />
                                </div>
                            </div>

                            <div className="form-section mt-25">
                                <h4 className="section-title">Contact Details</h4>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <div className="phone-input">
                                        <span className="prefix">+91</span>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="1234567890" required />
                                    </div>
                                </div>

                                <div className="available-date-box mt-20">
                                    <label>Available Date</label>
                                    <select name="availableDate" value={formData.availableDate} onChange={handleInputChange} required>
                                        <option value="" disabled>Select a date</option>
                                        {availableData.map((item) => (
                                            <option key={item.date} value={item.date}>{item.date}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.availableDate && (
                                    <div className="available-date-box mt-20">
                                        <label>Available Slots</label>
                                        <select name="slot" value={formData.slot} onChange={handleInputChange} required>
                                            <option value="" disabled>Select a time slot</option>
                                            {availableData
                                                .find((item) => item.date === formData.availableDate)
                                                ?.timeSlot.map((slot) => (
                                                    <option key={slot} value={slot}>{slot}</option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="input-group mt-15">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@example.com" required />
                                </div>
                            </div>

                            <div className="form-section mt-25">
                                <div className="input-group full-width">
                                    <label>Consultation Details</label>
                                    <textarea name="details" value={formData.details} onChange={handleInputChange} placeholder="Enter Consultation Details"></textarea>
                                </div>
                            </div>

                            <div className="recaptcha-container my-4 flex justify-center">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={recaptchaSiteKey}
                                    onChange={onCaptchaChange}
                                    theme="dark"
                                />
                            </div>

                            <div className="form-actions mt-25">
                                <Button type="submit" variant="secondary" className="submit-btn" disabled={isLoading || !captchaToken}>
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentModal;
