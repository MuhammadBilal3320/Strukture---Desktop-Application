import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiCommentX } from "react-icons/bi";
import { FaTrash, FaCopy, FaPaste } from "react-icons/fa";
import CustomToaster from "../common/CustomToaster";

// Universal comment remover function
function removeCommentsUniversal(code) {
    if (!code) return "";

    const patterns = [
        /\/\/.*(?=[\n\r]|$)/g,        // JS/Java/C++ single-line
        /#.*(?=[\n\r]|$)/g,           // Python single-line
        /\/\*[\s\S]*?\*\//g,          // multi-line /* ... */
        /<!--[\s\S]*?-->/g,           // HTML/XML
    ];

    let cleaned = code;
    patterns.forEach((p) => (cleaned = cleaned.replace(p, "")));

    cleaned = cleaned
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");

    return cleaned.trim();
}

const CommentsRemoverModal = ({ isOpen, onClose, currentValue }) => {
    const [inputText, setInputText] = useState(currentValue || "");
    const [preview, setPreview] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [isCleared, setIsCleared] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isPasted, setIsPasted] = useState(false);

    const handleRemoveComments = () => {
        const cleaned = removeCommentsUniversal(inputText);
        setPreview(cleaned);
        setShowPreview(true);
        window.toastSuccess("Comments removed successfully!");
    };

    const handleClear = () => {
        setInputText("");
        setPreview("");
        setShowPreview(false);
        setIsCleared(true);
        window.toastSuccess("Input cleared!");
        setTimeout(() => {
            setIsCleared(false);
        }, 2000);
    };

    const handleCopy = () => {
        if (!preview) return;
        navigator.clipboard.writeText(preview);
        setIsCopied(true);
        window.toastSuccess("Copied to clipboard!");
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputText(text);
            setIsPasted(true);
            window.toastSuccess("Pasted from clipboard!");
            setTimeout(() => setIsPasted(false), 2000);
        } catch (error) {
            console.error("Paste failed:", error);
            window.toastError("Paste failed!");
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        setInputText(currentValue || "");
    }, [currentValue, isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <CustomToaster />
            <div className="fixed inset-0 bg-[#00000049] bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-[#1C1D25] w-[800px] h-[75vh] p-5 rounded-lg shadow-xl text-white overflow-hidden flex flex-col">

                    <div className="modalMainHeading-information flex items-center justify-between">
                        <h2 className="text-lg font-semibold mb-4 perfectCenter gap-2">
                            <BiCommentX className="text-green-400" />Comment Remover
                        </h2>

                        <div>
                            <div className="group relative">
                                <button
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                >
                                    <AiOutlineInfoCircle size={14} />
                                    <span>Information</span>
                                </button>

                                {/* Tooltip Content */}
                                <div className="hidden group-hover:block absolute right-1 top-7 z-10 w-[500px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg leading-relaxed">
                                    <ul className="space-y-1 pl-1">
                                        <li>This tool removes comments from your code without touching the structure.</li>
                                        <li>Supported comment styles include:</li>

                                        <li className="ml-4">• <strong>// single-line</strong> (JS, Java, C++)</li>
                                        <li className="ml-4">• <strong># single-line</strong> (Python, YAML)</li>
                                        <li className="ml-4">• <strong>/* ... */ multi-line</strong> comment blocks</li>
                                        <li className="ml-4">• <strong>&lt;!-- ... --&gt;</strong> HTML/XML comments</li>

                                        <li>Click <strong>Remove Comments</strong> to generate a cleaned version.</li>
                                        <li>The preview panel shows your processed output.</li>
                                        <li>You can <strong>Copy</strong>, <strong>Clear</strong>, or <strong>Paste</strong> at any time.</li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Input / Original */}
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        <div className="flex-1 flex flex-col">

                            <div className="inputLable-copy-clearButtons flex items-center justify-between">
                                <label className="block text-sm mb-1">Original (With Comments)</label>

                                <div className="clear-paste-buttons flex gap-5 m-1.5">

                                    <button
                                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#E57373]
                       font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#FF8A80]
                       transition opacity-70 hover:opacity-100 flex items-center justify-center"
                                        onClick={handleClear}
                                        disabled={!inputText && !preview}
                                    >
                                        <FaTrash size={12} />
                                        {isCleared ? "Cleared" : "Clear"}
                                    </button>

                                    {!showPreview && <button
                                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#81C784]
                       font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#A5D6A7]
                       transition opacity-70 hover:opacity-100 flex items-center justify-center"
                                        onClick={handlePaste}
                                    >
                                        <FaPaste size={12} />
                                        {isPasted ? "Pasted" : "Paste"}
                                    </button>}

                                </div>
                            </div>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Example:\n\nproject-root/\n│\n├── src/                 # source code directory\n│   ├── api/             # API request handlers\n│   ├── hooks/           # custom React hooks\n│   ├── context/         # global providers / contexts\n│   └── styles/          # CSS / SCSS files\n│\n├── tests/               # Unit & integration tests\n├── public/              # Assets, favicon, static files\n│\n├── .gitignore           # Git ignored files list\n├── package.json         # App metadata & dependencies\n└── vite.config.js       # Build tool configuration`}
                                className="flex-1 px-3 py-2 bg-[#14151C] outline-none border border-gray-600 rounded text-white font-mono text-sm resize-none whitespace-pre overflow-auto"
                            />

                        </div>

                        {/* Preview / Cleaned */}
                        {showPreview && (
                            <div className="flex-1 flex flex-col overflow-auto">
                                <div className="previewLabel-copybutton flex items-center justify-between p-1">
                                    <label className="block text-sm mb-1">Preview (Without Comments)</label>
                                    <button
                                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#64B5F6]
                       font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#90CAF9]
                       transition opacity-70 hover:opacity-100 flex items-center justify-center"
                                        onClick={handleCopy}
                                        disabled={!showPreview}
                                    >
                                        <FaCopy size={12} />
                                        {isCopied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto border border-gray-600 rounded p-2 bg-[#14151C] font-mono text-sm whitespace-pre">
                                    {preview}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-3">
                        <button
                            className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] hover:ring-black rounded-full hover:bg-black"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full hover:bg-[#11bb4a]"
                            onClick={handleRemoveComments}
                            disabled={!inputText.trim() || showPreview}
                        >
                            Remove Comments
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommentsRemoverModal;
