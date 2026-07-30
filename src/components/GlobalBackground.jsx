import React, { useEffect, useRef } from 'react';

const GlobalBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext?.('2d');
        if (!ctx) return;

        const particles = [];
        const particleCount = 80;
        const mouse = { x: 0, y: 0, radius: 180 };
        let animationFrameId = null;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 2 + 1.5;
                this.speed = Math.random() * 1.2 + 1;
                this.swaySpeed = Math.random() * 0.04 + 0.02;
                this.swayAmount = Math.random() * 2.5 + 1.5;
                this.angle = Math.random() * Math.PI * 2;
            }

            update() {
                this.y -= this.speed;
                this.angle += this.swaySpeed;
                this.x += Math.sin(this.angle) * this.swayAmount;

                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius && distance > 0) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const dirX = dx / distance;
                    const dirY = dy / distance;
                    this.x += dirX * force * 9;
                    this.y += dirY * force * 9;
                }

                if (this.y + this.size < 0) this.reset();
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = 1.85;
                ctx.shadowBlur = 48;
                ctx.shadowColor = '#ffffffff';
                ctx.fillStyle = '#ffffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i += 1) {
                particles.push(new Particle());
            }
        };

        const trackMouse = (event) => {
            mouse.x = event.clientX || (event.touches && event.touches[0]?.clientX) || mouse.x;
            mouse.y = event.clientY || (event.touches && event.touches[0]?.clientY) || mouse.y;
        };

        const animate = () => {
            if (document.hidden) {
                animationFrameId = window.requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            animationFrameId = window.requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', trackMouse);
        window.addEventListener('touchmove', trackMouse);
        resizeCanvas();
        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', trackMouse);
            window.removeEventListener('touchmove', trackMouse);
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

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
