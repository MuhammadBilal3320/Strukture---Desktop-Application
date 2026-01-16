import React, { useState, useRef, useEffect } from "react";
import {
    BsFolder,
    BsClipboard,
    BsCheck,
    BsArrowDownCircle,
    BsTrash,
    BsArrowCounterclockwise,
    BsArrowsAngleExpand,
    BsArrowsAngleContract,
} from "react-icons/bs";
import TopBar from "./TopBar";



const MainArea = ({ selectedFolder, setSelectedFolder, currentValue, setCurrentValue }) => {
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState(false);
    const [cleared, setCleared] = useState(false);
    const [undoed, setUndoed] = useState(false);
    const [wrapped, setWrapped] = useState(true);
    const [folderPasted, setFolderPasted] = useState(false);
    const [history, setHistory] = useState([]);



    const textareaRef = useRef(null);

    // === Track changes for universal undo ===
    const handleChange = (e) => {
        setHistory((prev) => [...prev, currentValue]);
        setCurrentValue(e.target.value);
    };


    const handleUndo = () => {
        if (history.length === 0) return;

        const lastValue = history[history.length - 1];

        setHistory((prev) => prev.slice(0, -1));
        setCurrentValue(lastValue);

        if (textareaRef.current) textareaRef.current.value = lastValue;

        setUndoed(true);
        setTimeout(() => setUndoed(false), 1500);
    };


    // === Clipboard Actions ===
    const handleCopy = () => {
        if (textareaRef.current) {
            navigator.clipboard.writeText(textareaRef.current.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePaste = async () => {
        if (textareaRef.current) {
            const text = await navigator.clipboard.readText();

            setHistory((prev) => [...prev, currentValue]);  // save for undo

            textareaRef.current.value = text;
            setCurrentValue(text);

            setPasted(true);
            setTimeout(() => setPasted(false), 2000);
        }
    };


    const handleClear = () => {
        if (textareaRef.current) {

            setHistory((prev) => [...prev, currentValue]);  // save for undo

            textareaRef.current.value = "";
            setCurrentValue("");
            setSelectedFolder(null);
            setFolderPasted(false);

            setCleared(true);
            setTimeout(() => setCleared(false), 2000);
        }
    };


    // === Folder Selection ===
    const handleBrowseClick = async () => {
        try {
            const folder = await window.api.selectFolder();
            if (folder) {
                setSelectedFolder(folder);

                // Let UI update before running the heavy scan
                setTimeout(async () => {
                    const result = await window.api.runPython("scan_folder", { path: folder });
                }, 200);
            }
        } catch (err) {
            console.error("Failed to select folder:", err);
        }
    };

    const handleFolderPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setSelectedFolder(text);
                setFolderPasted(true);
                setTimeout(() => setFolderPasted(false), 2000);
            }
        } catch (err) {
            console.error("Failed to paste folder path:", err);
        }
    };

    // sync textarea with currentValue on mount/update
    useEffect(() => {
        if (textareaRef.current) textareaRef.current.value = currentValue;
    }, [currentValue]);

    return (
        <main className="flex-1 flex flex-col h-[100vh] gap-2 overflow-hidden bg-[#1A1C28] rounded-lg shadow-lg">

            {/* Target Folder */}
            <section className="flex flex-col gap-2 p-3 bg-[#1A1C28] rounded-md shadow-inner">
                <TopBar />
                <h2 className="text-white font-semibold text-sm">Target Folder</h2>

                <div className="flex items-center w-full rounded-2xl bg-[#1A1C28] border border-[#333541] overflow-hidden focus-within:border-[#50c878] focus-within:ring-1 focus-within:ring-[#50c878]/50 transition">
                    <button
                        onClick={handleBrowseClick}
                        className="flex items-center rounded-2xl mx-0.5 gap-1 px-4 py-1 bg-[#50c878] hover:bg-[#449c62] text-black text-xs font-semibold border-r border-[#333541] transition"
                    >
                        <BsFolder />
                        <span>Browse</span>
                    </button>

                    <input
                        type="text"
                        value={selectedFolder || ""}
                        readOnly
                        placeholder="Select or paste folder path..."
                        className="flex-1 px-2 py-1 bg-transparent text-white text-sm outline-none cursor-default"
                    />

                    {!selectedFolder ? (
                        <button
                            onClick={handleFolderPaste}
                            className="flex items-center w-20 rounded-2xl mx-0.5 gap-1 px-3 py-1 bg-[#2C2F3B] hover:bg-[#383C4A] text-[#a781c7] hover:text-[#A5D6A7] text-xs font-semibold border-l border-[#333541] transition"
                        >
                            {folderPasted ? <BsCheck /> : <BsArrowDownCircle />}
                            <span>{folderPasted ? "Pasted!" : "Paste"}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setSelectedFolder("")}
                            className="flex items-center w-20 rounded-2xl mx-0.5 gap-1 px-3 py-1 bg-[#2C2F3B] hover:bg-[#383C4A] text-[#E57373] hover:text-[#FF8A80] text-xs font-semibold border-l border-[#333541] transition"
                        >
                            <BsTrash />
                            <span>Clear</span>
                        </button>
                    )}

                </div>
            </section>

            {/* Structure Input */}
            <section className="flex-1 flex flex-col p-3 bg-[#1A1C28] rounded-md shadow-inner relative">
                <h2 className="text-white py-1.5 px-3 bg-[#14151C] rounded-t-xl font-semibold text-md">
                    Structure Input
                </h2>

                <textarea
                    value={currentValue}
                    onChange={handleChange}
                    ref={textareaRef}
                    placeholder="Paste or collect your project structure..."
                    style={{
                        whiteSpace: wrapped ? "pre-wrap" : "pre",
                        overflowX: wrapped ? "hidden" : "auto",
                    }}
                    className="flex-1 w-full p-2 rounded bg-[#14151C] text-[#e0e0e0] outline-none font-mono text-sm resize-none shadow-inner"
                />


                {/* Controls */}
                <div className="button-container p-1 absolute top-4 right-4 flex justify-center items-center gap-3">
                    {/* Undo */}
                    <button
                        onClick={handleUndo}
                        disabled={history === ""}
                        className={`w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs font-semibold rounded-md shadow transition opacity-70 hover:opacity-100 ${history
                            ? "bg-[#2C2F3B] text-[#64B5F6] hover:bg-[#383C4A] hover:text-[#90CAF9]"
                            : "bg-[#2C2F3B] text-gray-600 cursor-not-allowed"
                            }`}
                    >
                        {undoed ? <BsCheck /> : <BsArrowCounterclockwise />}
                        <span>{undoed ? "Undoed!" : "Undo"}</span>
                    </button>

                    {/* Clear */}
                    <button
                        onClick={handleClear}
                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#E57373] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#FF8A80] transition opacity-70 hover:opacity-100"
                    >
                        {cleared ? <BsCheck /> : <BsTrash />}
                        <span>{cleared ? "Cleared!" : "Clear"}</span>
                    </button>

                    {/* Wrap / Unwrap */}
                    <button
                        onClick={() => setWrapped((prev) => !prev)}
                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#FFD54F] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#FFE082] transition opacity-70 hover:opacity-100"
                    >
                        {wrapped ? <BsArrowsAngleContract /> : <BsArrowsAngleExpand />}
                        <span>{wrapped ? "Unwrap" : "Wrap"}</span>
                    </button>

                    {/* Paste */}
                    <button
                        onClick={handlePaste}
                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#81C784] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#A5D6A7] transition opacity-70 hover:opacity-100"
                    >
                        {pasted ? <BsCheck /> : <BsArrowDownCircle />}
                        <span>{pasted ? "Pasted!" : "Paste"}</span>
                    </button>

                    {/* Copy */}
                    <button
                        onClick={handleCopy}
                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#64B5F6] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#90CAF9] transition opacity-70 hover:opacity-100"
                    >
                        {copied ? <BsCheck /> : <BsClipboard />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                </div>
            </section>
        </main>
    );
};

export default MainArea;
