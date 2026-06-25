import { useEffect } from 'react';

const useParticles = (canvasRef) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 80; // Reduced from 100 for performance
        let animationFrameId;

        const mouse = {
            x: 0,
            y: 0,
            radius: 180
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

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

                // Mouse repulsion
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
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const trackMouse = (e) => {
            mouse.x = e.clientX || (e.touches && e.touches[0].clientX);
            mouse.y = e.clientY || (e.touches && e.touches[0].clientY);
        };

        window.addEventListener('mousemove', trackMouse);
        window.addEventListener('touchmove', trackMouse);

        const animate = () => {
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', trackMouse);
            window.removeEventListener('touchmove', trackMouse);
            cancelAnimationFrame(animationFrameId);
        };
    }, [canvasRef]);
};

export default useParticles;
