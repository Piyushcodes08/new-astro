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
        primary: "!bg-white !text-[#dd2727] hover:!bg-[#dd2727] hover:!text-white mt-5",
        secondary: "!bg-[#dd2727] !text-white hover:!bg-white hover:!text-[#dd2727] mt-5"
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
