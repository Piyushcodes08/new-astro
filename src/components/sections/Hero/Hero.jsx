import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button/Button';
import { homeData } from '../../../data/pages/home';

const Hero = () => {
    const navigate = useNavigate();

    const { hero } = homeData;
    const { title, description, buttonText } = hero;

    return (
        <section className="relative min-h-screen min-h-svh w-full overflow-hidden bg-transparent text-white flex items-center justify-center text-center px-4 ">

            {/* Canvas Background Support */}
            <canvas
                id="canvas"
                className="fixed inset-0 z-1 pointer-events-none"
            />

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-max-width min-h-svh mx-auto px-[50px] max-lg:px-[30px] max-md:px-[15px] flex pt-12 items-center justify-center">
                
                <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
                    


                    {/* Hero Title */}
                    <h1
                        id="hero-title"
                        className="font-['Batangas'] text-white font-black text-center leading-[1.08] mb-6 text-[clamp(3rem,8vw,7rem)] max-lg:text-[clamp(3rem,9vw,5.8rem)] max-md:text-[clamp(2.4rem,12vw,4rem)] max-md:leading-[1.12] max-md:mb-[18px]"
                    >
                        {title}
                    </h1>

                    {/* Hero Description */}
                    <p className="text-[18px] max-lg:text-[17px] max-md:text-sm text-white/80 max-w-[760px] mx-auto leading-[1.8] max-md:leading-[1.7] font-medium">
                        {description}
                    </p>

                    {/* CTA Button */}
                    <div className="mt-[34px] max-md:mt-7 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/appointment')}
                        >
                            {buttonText}
                        </Button>
                    </div>

                    {/* Red Dot Divider */}
                    <div className="mt-12 max-md:mt-9 flex items-center justify-center gap-4">
                        <div className="h-px w-12 max-md:w-[38px] bg-linear-to-r from-transparent to-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_18px_#bf0603]" />
                        <div className="h-px w-12 max-md:w-[38px] bg-linear-to-l from-transparent to-white/20" />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;