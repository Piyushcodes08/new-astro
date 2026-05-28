import React, { useRef } from 'react';
import useParticles from '../hooks/useParticles';

const GlobalBackground = () => {
    const canvasRef = useRef(null);
    
    // Initialize the cosmic particles globally
    useParticles(canvasRef);

    return (
        <canvas 
            ref={canvasRef}
            id="global-canvas"
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
            style={{ display: 'block' }}
        />
    );
};

export default GlobalBackground;
