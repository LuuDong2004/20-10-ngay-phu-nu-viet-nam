/* eslint-disable */
import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function VNWomen2010Celebration({
                                                   title = "Chúc mừng ngày Phụ nữ Việt Nam 20/10",
                                                   subtitle = "Chúc cả nhà mình luôn xinh đẹp, hạnh phúc và tỏa sáng như những đóa hoa 💐",
                                               }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const particlesRef = useRef([]);
    const sparklesRef = useRef([]);
    const audioRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showPlayOverlay, setShowPlayOverlay] = useState(true);

    const theme = useMemo(
        () => ({
            bgFrom: "#ffe6f0",
            bgTo: "#ffb3d1",
            accent: "#ff69b4",
            petals: ["#ff69b4", "#ff1493", "#ffc0cb", "#ff91a4", "#ffb6c1", "#ffa0b4"],
            hearts: ["#ff1493", "#ff69b4", "#ffc0cb", "#ff91a4"],
            textGradient: {
                primary: "rgba(255,255,255,0.95)",
                secondary: "rgba(255,255,255,0.9)",
            },
        }),
        []
    );

    const R = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];
    const isMobileScreen = () => window.matchMedia("(max-width: 600px)").matches;

    function heartPath(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0.35);
        ctx.bezierCurveTo(0, 0.15, -0.25, 0.0, -0.5, 0.0);
        ctx.bezierCurveTo(-0.9, 0.0, -0.95, 0.45, -0.95, 0.45);
        ctx.bezierCurveTo(-0.95, 0.8, -0.6, 1.05, 0, 1.35);
        ctx.bezierCurveTo(0.6, 1.05, 0.95, 0.8, 0.95, 0.45);
        ctx.bezierCurveTo(0.95, 0.45, 0.9, 0.0, 0.5, 0.0);
        ctx.bezierCurveTo(0.25, 0.0, 0, 0.15, 0, 0.35);
        ctx.closePath();
    }

    function flowerPath(ctx) {
        ctx.beginPath();
        const petals = 5;
        for (let i = 0; i < petals; i++) {
            const a = (i * (Math.PI * 2)) / petals;
            const x = Math.cos(a);
            const y = Math.sin(a);
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(x * 0.6, y * 0.6, x, y);
            ctx.quadraticCurveTo(x * 0.6, y * 0.6, 0, 0);
        }
        ctx.closePath();
    }

    function createParticle(w, h) {
        const mobile = isMobileScreen();
        const isHeart = Math.random() < 0.4;
        const size = mobile ? R(6, 14) : R(8, 20);
        return {
            x: R(0, w),
            y: R(-40, h),
            z: R(mobile ? 0.7 : 0.5, mobile ? 1.0 : 1.3),
            vx: R(-0.08, 0.08),
            vy: R(mobile ? 0.2 : 0.25, mobile ? 0.7 : 0.9),
            rot: R(0, Math.PI * 2),
            vr: R(-0.008, 0.008),
            swayPhase: R(0, Math.PI * 2),
            size,
            color: pick(isHeart ? theme.hearts : theme.petals),
            type: isHeart ? "heart" : "flower",
            glow: !mobile && Math.random() < 0.3,
            opacity: R(0.6, 0.95),
            scale: R(0.8, 1.2),
        };
    }

    function createSparkle(w, h) {
        return { x: R(0, w), y: R(0, h), size: R(2, 6), alpha: R(0.3, 1), twinkle: R(0, Math.PI * 2) };
    }

    // Cho autoplay im lặng, và bật tiếng khi user chạm
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;

        el.muted = true;
        el.volume = 0.9;

        const tryPlay = async () => {
            try {
                await el.play(); // phát im lặng
                setIsPlaying(true);
                setIsMuted(true);
                setShowPlayOverlay(true); // hiển thị nút "Nhấn để nghe"
            } catch {
                setShowPlayOverlay(true);
            }
        };
        tryPlay();
    }, []);

    useEffect(() => {
        const onFirstUserAction = () => {
            const el = audioRef.current;
            if (el) {
                el.muted = false;
                el.play();
            }
            setIsMuted(false);
            setIsPlaying(true);
            setShowPlayOverlay(false);
            window.removeEventListener("pointerdown", onFirstUserAction);
        };
        window.addEventListener("pointerdown", onFirstUserAction);
        return () => window.removeEventListener("pointerdown", onFirstUserAction);
    }, []);

    // Canvas animation (bỏ warning ESLint với comment ở đầu file)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        function resize() {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        const baseDensity = isMobileScreen() ? 18000 : 22000;
        const seedCount = Math.min(
            isMobileScreen() ? 60 : 100,
            Math.max(40, (window.innerWidth * window.innerHeight) / baseDensity)
        );
        particlesRef.current = Array.from({ length: seedCount }, () =>
            createParticle(window.innerWidth, window.innerHeight)
        );
        sparklesRef.current = Array.from({ length: isMobileScreen() ? 25 : 45 }, () =>
            createSparkle(window.innerWidth, window.innerHeight)
        );

        function drawParticle(p) {
            ctx.save();
            const sway = Math.sin(p.swayPhase + p.y * 0.008) * 0.4 * p.z;
            ctx.translate(p.x + sway, p.y);
            ctx.rotate(p.rot);
            ctx.scale(p.size * p.scale, p.size * p.scale);

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, p.color + "40");
            if (p.type === "heart") heartPath(ctx);
            else flowerPath(ctx);
            ctx.fillStyle = gradient;
            ctx.globalAlpha = p.opacity;
            ctx.fill();

            if (p.glow) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.globalAlpha = p.opacity * 0.8;
                ctx.fill();
            }
            ctx.restore();
        }

        function drawSparkles(ctx2) {
            for (const s of sparklesRef.current) {
                ctx2.save();
                ctx2.globalAlpha = Math.sin(s.twinkle + Date.now() * 0.003) * 0.5 + 0.3;
                ctx2.fillStyle = theme.accent;
                ctx2.beginPath();
                ctx2.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx2.fill();
                ctx2.shadowBlur = 8;
                ctx2.shadowColor = theme.accent;
                ctx2.fill();
                ctx2.restore();
                s.twinkle += 0.05;
            }
        }

        function frame() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            const sorted = [...particlesRef.current].sort((a, b) => a.z - b.z);
            for (const p of sorted) {
                p.y += p.vy * p.z * 0.85;
                p.x += p.vx + Math.sin((p.y + p.swayPhase * 40) * 0.005) * 0.12;
                p.rot += p.vr;
                p.scale = 0.9 + Math.sin(Date.now() * 0.002 + p.swayPhase) * 0.1;

                if (p.y - p.size > window.innerHeight + 40) {
                    Object.assign(p, createParticle(window.innerWidth, window.innerHeight));
                    p.y = -20;
                }
                drawParticle(p);
            }
            drawSparkles(ctx);
            rafRef.current = requestAnimationFrame(frame);
        }

        rafRef.current = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [theme]);

    // Controls
    const togglePlayPause = () => {
        const el = audioRef.current;
        setIsPlaying((p) => {
            const next = !p;
            if (el) next ? el.play() : el.pause();
            if (next) setShowPlayOverlay(false);
            return next;
        });
    };

    const toggleMute = () => {
        const el = audioRef.current;
        setIsMuted((m) => {
            const next = !m;
            if (el) el.muted = next;
            return next;
        });
    };

    return (
        <div
            className="relative safe-area"
            style={{
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                background: `
          radial-gradient(1400px 900px at 70% 10%, rgba(255,192,203,0.3), transparent 50%),
          radial-gradient(800px 600px at 30% 80%, rgba(255,105,180,0.2), transparent 60%),
          radial-gradient(600px 400px at 50% 50%, rgba(255,182,193,0.15), transparent 70%),
          linear-gradient(135deg, ${theme.bgFrom} 0%, ${theme.bgTo} 50%, #ffb6c1 100%)
        `,
                touchAction: "none",
            }}
        >
            {/* Audio nội bộ (đặt file tại public/audio/nhac.mp3) */}
            <audio
                ref={audioRef}
                src={`${process.env.PUBLIC_URL}/audio/nhac.mp3`}
                preload="auto"
                loop
                style={{ display: "none" }}
            />

            {/* Nút điều khiển */}
            <div
                style={{
                    position: "absolute",
                    top: isMobileScreen() ? 16 : 20,
                    right: isMobileScreen() ? 16 : 20,
                    zIndex: 1000,
                    display: "flex",
                    gap: isMobileScreen() ? 8 : 12,
                    alignItems: "center",
                }}
            >
                <motion.button
                    onClick={togglePlayPause}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,182,193,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    style={{
                        background: "rgba(255,182,193,0.2)",
                        border: "2px solid rgba(255,105,180,0.4)",
                        borderRadius: "50%",
                        width: isMobileScreen() ? 44 : 52,
                        height: isMobileScreen() ? 44 : 52,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(15px)",
                        color: "white",
                        fontSize: isMobileScreen() ? 16 : 20,
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 20px rgba(255,105,180,0.3)",
                    }}
                >
                    {isPlaying ? "⏸️" : "▶️"}
                </motion.button>

                <motion.button
                    onClick={toggleMute}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,182,193,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    style={{
                        background: "rgba(255,182,193,0.2)",
                        border: "2px solid rgba(255,105,180,0.4)",
                        borderRadius: "50%",
                        width: isMobileScreen() ? 44 : 52,
                        height: isMobileScreen() ? 44 : 52,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(15px)",
                        color: "white",
                        fontSize: isMobileScreen() ? 16 : 20,
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 20px rgba(255,105,180,0.3)",
                    }}
                >
                    {isMuted ? "🔇" : "🔊"}
                </motion.button>
            </div>

            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

            {/* Overlay yêu cầu người dùng click để bật tiếng */}
            {showPlayOverlay && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={togglePlayPause}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 9999,
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: "rgba(255,182,193,0.3)",
                            backdropFilter: "blur(20px)",
                            borderRadius: "50%",
                            width: 120,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "3px solid rgba(255,105,180,0.5)",
                            boxShadow: "0 8px 40px rgba(255,105,180,0.4)",
                            color: "#fff",
                            fontSize: 48,
                        }}
                    >
                        ▶️
                    </motion.div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "20%",
                            color: "white",
                            fontSize: 18,
                            fontWeight: 500,
                            textAlign: "center",
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                    >
                        Nhấn để nghe nhạc 🎵
                    </div>
                </motion.div>
            )}

            {/* Text block */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    textAlign: "center",
                    color: "#fff",
                    padding: 16,
                }}
            >
                <div style={{ maxWidth: 920, width: "min(92vw, 920px)", padding: "0 12px" }}>
                    <motion.h1
                        className="headline"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            fontSize: "clamp(28px, 5.5vw, 64px)",
                            fontWeight: 800,
                            color: theme.textGradient.primary,
                            textShadow:
                                "0 4px 20px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 0 0 30px rgba(255,105,180,0.4)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
                        }}
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        className="subline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        style={{
                            marginTop: 16,
                            fontSize: "clamp(16px, 3vw, 24px)",
                            fontWeight: 500,
                            color: theme.textGradient.secondary,
                            lineHeight: 1.4,
                            maxWidth: 600,
                            marginInline: "auto",
                            textShadow:
                                "0 3px 15px rgba(0,0,0,0.8), 0 1px 6px rgba(0,0,0,0.6), 0 0 20px rgba(255,105,180,0.3)",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}
                    >
                        {subtitle}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
