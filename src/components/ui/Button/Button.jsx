import React from 'react';
import './Button.css';

const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "primary", 
    type = "button" 
}) => {
    // Base styles following the user's preferred "perfect" aesthetic
    const baseClasses = "rounded-full uppercase font-bold text-base transition-all duration-300 shadow-lg !px-8 !py-3 inline-block";
    
    // Variant styles
    const variants = {
        primary: "!bg-white !text-[#bf0603] hover:!bg-[#bf0603] hover:!text-white mt-5",
        secondary: "!bg-[#bf0603] !text-white hover:!bg-white hover:!text-[#bf0603] mt-5"
    };

    const combinedClasses = `${baseClasses} ${variants[variant] || ""} ${className}`;

    return (
        <button 
            type={type} 
            onClick={onClick} 
            className={combinedClasses}
        >
            {children}
        </button>
    );
};

export default Button;
