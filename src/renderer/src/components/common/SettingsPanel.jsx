import React, { useEffect, useRef, useState } from "react";
import { FaCog, FaUser, FaInfoCircle, FaChartBar } from "react-icons/fa";

const SettingsPanel = ({ isOpen, onClose }) => {
    const ref = useRef();
    const [activeOption, setActiveOption] = useState("general");

    // Close when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen, onClose]);

    return (
        <div
            ref={ref}
            className={`
                fixed right-6 top-6
                w-[520px] h-[480px]
                bg-[#1C1D25] text-gray-300
                rounded-lg border border-[#30323A] shadow-xl p flex
                transition-transform duration-300 ease-out z-50 

                ${isOpen ? "opacity-100 translate-y-8  " : " -translate-y-[110%] opacity-0 pointer-events-none"}
            `}
        >

            {/* Left Sidebar */}
            <div className="w-36 flex flex-col gap-2 p-1">
                <button
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-r-full
                        hover:bg-[#2C2F3B] transition
                        ${activeOption === "general" ? "bg-[#2C2F3B] border-l-4 border-[#50c878]" : ""}
                    `}
                    onClick={() => setActiveOption("general")}
                >
                    <FaCog className="text-[#81C784]" /> General
                </button>

                <button
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-r-full
                        hover:bg-[#2C2F3B] transition
                        ${activeOption === "statistics" ? "bg-[#2C2F3B] border-l-4 border-[#50c878]" : ""}
                    `}
                    onClick={() => setActiveOption("statistics")}
                >
                    <FaChartBar className="text-[#81C784]" /> Statistics
                </button>

                <button
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-r-full
                        hover:bg-[#2C2F3B] transition
                        ${activeOption === "account" ? "bg-[#2C2F3B] border-l-4 border-[#50c878]" : ""}
                    `}
                    onClick={() => setActiveOption("account")}
                >
                    <FaUser className="text-[#81C784]" /> Account
                </button>

                <button
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-r-full
                        hover:bg-[#2C2F3B] transition
                        ${activeOption === "about" ? "bg-[#2C2F3B] border-l-4 border-[#50c878]" : ""}
                    `}
                    onClick={() => setActiveOption("about")}
                >
                    <FaInfoCircle className="text-[#81C784]" /> About
                </button>
            </div>

            {/* Right Panel */}
            <div className="flex-1 bg-[#25262e] overflow-y-auto px-4 py-2">
                {activeOption === "general" && (
                    <div>
                        <h2 className="font-semibold text-lg mb-3 text-white">General Settings</h2>
                        <p className="text-gray-400 text-sm">
                            Add your general settings here...
                        </p>
                    </div>
                )}

                {activeOption === "statistics" && (
                    <div>
                        <h2 className="font-semibold text-lg mb-3 text-white">Statistics</h2>
                        <p className="text-gray-400 text-sm">
                            Your statistics options go here.
                        </p>
                    </div>
                )}

                {activeOption === "account" && (
                    <div>
                        <h2 className="font-semibold text-lg mb-3 text-white">Account Settings</h2>
                        <p className="text-gray-400 text-sm">
                            Account-related options go here.
                        </p>
                    </div>
                )}

                {activeOption === "about" && (
    <div className="bg-[#262833] p-6 rounded-lg shadow-lg w-full flex flex-col gap-5 border border-[#3A3C46]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#50c878]">Strukture</h2>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">v1.0</span>
            </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed">
            Strukture is a lightweight and powerful tool to manage, visualize, and generate project folder structures.
            Preview folder hierarchies, exclude specific folders, and quickly create project templates with ease.
        </p>

        {/* Info Grid */}
        {/* Compact Info Row */}
<div className="flex flex-wrap gap-4 text-gray-300 text-sm">
    <div className="flex items-center gap-1">
        <span className="font-semibold text-[#50c878]">Author:</span>
        <span>Muhammad Bilal</span>
    </div>
    <div className="flex items-center gap-1">
        <span className="font-semibold text-[#50c878]">License:</span>
        <span>MIT</span>
    </div>
    <div className="flex items-center gap-1">
        <span className="font-semibold text-[#50c878]">Tech:</span>
        <span>React & Tailwind CSS</span>
    </div>
    <div className="flex items-center gap-1">
        <span className="font-semibold text-[#50c878]">Purpose:</span>
        <span>Fast & organized setup</span>
    </div>
</div>


        {/* Footer Note */}
        <div className="border-t border-gray-700 pt-2">
            <p className="text-gray-400 text-xs italic">
                Designed for developers who value speed, structure, and efficiency in project workflows.
            </p>
        </div>
    </div>
)}

                
            </div>
        </div>
    );
};

export default SettingsPanel;
