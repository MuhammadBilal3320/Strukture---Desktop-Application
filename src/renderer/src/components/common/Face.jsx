import React, { useEffect, useState, useRef } from "react";

const Face = () => {
    const eyeRefs = [useRef(null), useRef(null)];
    const faceRef = useRef(null);

    const [pupilPos, setPupilPos] = useState([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
    ]);
    const [blink, setBlink] = useState(false);
    const [smile, setSmile] = useState(false);

    // Pupils follow cursor
    useEffect(() => {
        const handleMouseMove = (e) => {
            const newPos = eyeRefs.map((eyeRef) => {
                if (!eyeRef.current) return { x: 0, y: 0 };

                const rect = eyeRef.current.getBoundingClientRect();
                const eyeCenterX = rect.left + rect.width / 2;
                const eyeCenterY = rect.top + rect.height / 2;

                let dx = e.clientX - eyeCenterX;
                let dy = e.clientY - eyeCenterY;

                const maxRadius = rect.width / 2 - 2;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > maxRadius) {
                    const scale = maxRadius / distance;
                    dx *= scale;
                    dy *= scale;
                }

                return { x: dx, y: dy };
            });

            setPupilPos(newPos);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 200);
        }, 3000);

        return () => clearInterval(blinkInterval);
    }, []);

    // Smiling
    useEffect(() => {
        const smileInterval = setInterval(() => {
            setSmile(true);
            setTimeout(() => setSmile(false), 1500);
        }, 5000);

        return () => clearInterval(smileInterval);
    }, []);

    return (
        <div className="main-container overflow-clip w-full flex justify-center items-center">
            <div
                ref={faceRef}
                className="group relative flex flex-col items-center justify-center ring-2 ring-[#50c878] bg-black w-[80%] scale-85 m-1 rounded-full p-5 transition-all duration-300"
            >
                {/* Eyebrows */}
                <div className="flex gap-2">
                    {[0, 1].map((i) => (
                        <div key={i} className="w-4 h-2 relative">
                            <div className="absolute w-full h-0.5 rounded-b-full top-0 bg-white"></div>
                        </div>
                    ))}
                </div>

                {/* Eyes */}
                <div className="flex gap-2 items-center">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            ref={eyeRefs[i]}
                            className="w-4 h-4 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-transform duration-100"
                            style={{
                                transform: `scaleY(${blink ? 0.1 : 1})`,
                            }}
                        >
                            <div
                                className="w-2 h-2 bg-black rounded-full absolute transition-transform duration-50"
                                style={{
                                    transform: `translate(${pupilPos[i].x}px, ${pupilPos[i].y}px)`,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Smile */}
                <div
                    className={`mt-3 w-7 h-2 border-b-2 border-white rounded-b-full transition-all duration-300 ${
                        smile ? "opacity-100" : "opacity-0"
                    }`}
                />
            </div>
        </div>
    );
};

export default Face;
