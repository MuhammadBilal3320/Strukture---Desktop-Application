import React, { useState } from "react";
import { BsGear, BsQuestionCircle } from "react-icons/bs";
import SettingsPanel from "../common/SettingsPanel";


const TopBar = () => {
    const [openSettings, setOpenSettings] = useState(false);

    return (
        <header className="relative flex justify-between items-center px-6 py-1 bg-[#2c2c3c] shadow-md rounded-full">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <h1
                    className="text-[#50c878] font-extrabold text-2xl tracking-wide"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    STRUKTURE
                </h1>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => setOpenSettings(prev => !prev)}
                    className={` hover:text-[#50c878] ${openSettings ? "text-[#50c878]" : "text-[#e0e0e0]"} text-xl p-1 transition-colors`}
                >
                    <BsGear />
                </button>

            </div>

            {/* Settings Panel */}
            <SettingsPanel isOpen={openSettings} onClose={() => setOpenSettings(false)} />
        </header>
    );
};

export default TopBar;
