import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/sections/Header/Header';
import Footer from '../components/sections/Footer/Footer';
import AppointmentModal from '../components/modals/AppointmentModal/AppointmentModal';

const AppointmentPage = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setIsOpen(false);
        // Wait for the modal fade-out animation before navigating away
        setTimeout(() => {
            navigate(-1);
        }, 300);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 text-white overflow-hidden bg-transparent flex items-center justify-center">
                {/* Premium Transparent Cosmic Background */}
                <div className="absolute inset-0 -z-10 "></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/20 blur-[180px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/10 blur-[180px] rounded-full pointer-events-none"></div>

                {/* We render the AppointmentModal directly on this page */}
                <AppointmentModal isOpen={isOpen} onClose={handleClose} />
            </main>
            <Footer />
        </>
    );
};

export default AppointmentPage;

