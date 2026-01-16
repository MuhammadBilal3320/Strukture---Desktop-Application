import React, { useEffect, useState } from "react";
import {
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
} from "react-icons/ai";

const CustomToaster = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        window.toastSuccess = (msg) => addToast(msg, "success");
        window.toastError = (msg) => addToast(msg, "error");
    }, []);

    const addToast = (message, type) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 1800);
    };

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-[420px] items-center pointer-events-none">
            <style>
                {`
                @keyframes fadeSlide {
                    0% { opacity: 0; transform: translateY(-12px) scale(.97); }
                    100% { opacity: 1; transform: translateY(0px) scale(1); }
                }
                .fade-slide {
                    animation: fadeSlide 0.20s ease-out;
                }
                `}
            </style>

            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        w-full px-4 py-2.5 rounded-md fade-slide pointer-events-auto
                        flex items-center gap-3 text-sm shadow-[inset_0_0_8px_rgba(0,0,0,0.45)]
                        backdrop-blur-md bg-[#1C1D25]/60 border border-[#ffffff15]

                        ${toast.type === "success"
                            ? "border-l-4 border-l-green-400 text-green-300"
                            : "border-l-4 border-l-red-400 text-red-300"
                        }
                    `}
                >
                    <span className="text-xl flex-shrink-0 opacity-90">
                        {toast.type === "success" ? (
                            <AiOutlineCheckCircle />
                        ) : (
                            <AiOutlineCloseCircle />
                        )}
                    </span>

                    <span className="flex-1 leading-snug">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default CustomToaster;
