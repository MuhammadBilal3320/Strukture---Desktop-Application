import React, { useState, useEffect, useRef } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsFolder, BsFileEarmarkText } from "react-icons/bs";
import { RiExchange2Fill } from "react-icons/ri";
import CustomToaster from "../common/CustomToaster";

const ExactMakerModal = ({ isOpen, basePath, onClose }) => {
    const [structureText, setStructureText] = useState("");
    const [preview, setPreview] = useState([]);
    const [isCleared, setIsCleared] = useState(false);
    const [isPasted, setIsPasted] = useState(false);
    const [running, setRunning] = useState(false);
    const [progressMap, setProgressMap] = useState({});
    const [log, setLog] = useState([]);
    const [summary, setSummary] = useState(null);
    const cancelRequestedRef = useRef(false);

    const parseStructure = (text) => {
        const lines = String(text).split("\n").filter((line) => line.trim());
        const items = [];
        const pathStack = [];

        lines.forEach((line) => {
            const cleaned = line.replace(/[│├└─\s]+/, "").trim();
            if (!cleaned) return;

            const indent = line.search(/[^\s│]/);
            const level = indent >= 0 ? Math.floor(indent / 4) : 0;
            const isFile = !cleaned.endsWith("/");
            const name = cleaned.replace("/", "");

            pathStack.length = level + 1;
            pathStack[level] = name;

            const fullPath = pathStack.slice(0, level + 1).join("/");
            items.push({ name, isFile, level, fullPath });
        });

        return items;
    };

    const handleTextChange = (text) => {
        setStructureText(text);
        try {
            const parsed = parseStructure(text);
            setPreview(parsed);
        } catch {
            setPreview([]);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setStructureText(text);
            handleTextChange(text);
            setIsPasted(true);
            window.toastSuccess("Pasted successfully!");
            setTimeout(() => setIsPasted(false), 1500);
        } catch (err) {
            console.error(err);
            window.toastError("Failed to paste!");
        }
    };

    const handleClear = () => {
        setStructureText("");
        setPreview([]);
        setIsCleared(true);
        setProgressMap({});
        setLog([]);
        setSummary(null);
        window.toastSuccess("Cleared!");
        setTimeout(() => setIsCleared(false), 1500);
    };

    useEffect(() => {
        if (!window.api || !window.api.onExactMakerProgress) return;

        const onProgress = (_, payload) => {
            setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${payload.message || payload.status || payload.type}`]);

            if (payload.file) {
                setProgressMap((prev) => ({ ...prev, [payload.file]: payload.status || payload.type }));
            }
        };

        const onDone = (_, payload) => {
            setRunning(false);
            setSummary(payload || null);
            setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Done.`]);
        };

        const onError = (_, payload) => {
            setRunning(false);
            setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: ${payload?.error || "Unknown error"}`]);
        };

        const unsubProgress = window.api.onExactMakerProgress(onProgress);
        const unsubDone = window.api.onExactMakerDone(onDone);
        const unsubError = window.api.onExactMakerError(onError);

        return () => {
            unsubProgress && unsubProgress();
            unsubDone && unsubDone();
            unsubError && unsubError();
        };
    }, []);

    const startExactMake = async () => {
        if (!basePath) {
            window.toastError("No base path selected!");
            return;
        }
        if (!structureText.trim()) {
            window.toastError("Structure text missing!");
            return;
        }

        setProgressMap({});
        setLog([]);
        setSummary(null);
        cancelRequestedRef.current = false;
        setRunning(true);

        try {
            const options = { createBackup: true };
            await window.api.startExactMaker({ basePath, structureText, options });
        } catch (err) {
            console.error("startExactMaker failed:", err);
            window.toastError("Failed to start ExactMaker!");
            setRunning(false);
        }
    };

    const handleCancel = async () => {
        if (!running) {
            onClose && onClose();
            return;
        }
        try {
            await window.api.cancelExactMaker();
            setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Cancel requested.`]);
            cancelRequestedRef.current = true;
        } catch (err) {
            console.error("cancelExactMaker failed:", err);
            window.toastError("Failed to request cancel.");
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setStructureText("");
            setPreview([]);
            setProgressMap({});
            setLog([]);
            setSummary(null);
            setRunning(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <CustomToaster />
            <div className="fixed inset-0 bg-[#00000046] bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-[#1C1D25] w-[900px] max-h-[90vh] p-5 rounded-lg shadow-xl text-white overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <RiExchange2Fill className="text-green-400" />
                            ExactMaker - Restructure Project
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-300 mr-4">{basePath || "No path selected"}</div>
                            <div className="group relative">
                                <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
                                    <AiOutlineInfoCircle size={14} /> Info
                                </button>
                                <div className="hidden group-hover:block absolute right-0 top-8 z-10 w-[420px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg">
                                    <p className="text-sm">Paste the desired (final) folder structure. ExactMaker will move files one-by-one, update import paths across the project, and keep a backup.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between">
                                <label className="text-sm mb-1">Project Structure Input</label>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 text-xs bg-[#2C2F3B] rounded" onClick={handleClear}>{isCleared ? "Cleared" : "Clear"}</button>
                                    <button className="px-3 py-1 text-xs bg-[#2C2F3B] rounded" onClick={handlePaste}>{isPasted ? "Pasted" : "Paste"}</button>
                                </div>
                            </div>
                            <textarea
                                value={structureText}
                                onChange={(e) => handleTextChange(e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#14151C] outline-none border border-gray-600 rounded text-white font-mono text-sm resize-none whitespace-pre overflow-auto min-h-0"
                                placeholder={`Paste your desired final project structure here.\nExample:\nmy-project/\n├── src/\n│   ├── components/\n│   └── App.jsx\n├── public/\n└── package.json`}
                            />
                        </div>
                        <div className="w-[420px] flex flex-col min-h-0">
                            <label className="text-sm mb-1">Preview & Progress ({preview.length} items)</label>
                            <div className="flex-1 overflow-auto border border-gray-600 rounded p-2 bg-[#14151C] text-xs font-mono">
                                {preview.length === 0 && <div className="text-gray-400">Preview will appear here.</div>}
                                {preview.map((item, idx) => {
                                    const status = progressMap[item.fullPath] || "pending";
                                    return (
                                        <div key={idx} className="flex items-center justify-between gap-2 py-0.5" style={{ paddingLeft: item.level * 12 }}>
                                            <div className="flex items-center gap-2">
                                                {item.isFile ? <BsFileEarmarkText className="text-[#64B5F6]" /> : <BsFolder className="text-[#FFD54F]" />}
                                                <div className="truncate">{item.fullPath}</div>
                                            </div>
                                            <div className="w-20 text-right">
                                                {status === "pending" && <span className="text-yellow-300">●</span>}
                                                {status === "moved" && <span className="text-green-400">✔</span>}
                                                {status === "imports-updated" && <span className="text-green-400">✔✓</span>}
                                                {status === "error" && <span className="text-red-400">✖</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2 text-xs">
                                <div className="font-semibold mb-1">Activity Log</div>
                                <div className="h-36 overflow-auto border border-gray-700 rounded p-2 bg-[#0f1012] text-[11px]">
                                    {log.length === 0 && <div className="text-gray-400">No activity yet.</div>}
                                    {log.map((l, i) => <div key={i} className="text-gray-300">{l}</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] rounded-full hover:bg-black"
                            onClick={handleCancel}
                            disabled={!running}
                        >
                            {running ? "Cancel" : "Close"}
                        </button>
                        <button
                            className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full hover:bg-[#11bb4a]"
                            onClick={startExactMake}
                            disabled={running}
                        >
                            {running ? "Processing..." : "Exact Make"}
                        </button>
                    </div>
                    {summary && (
                        <div className="mt-3 text-sm text-gray-300">
                            <div><strong>Summary:</strong></div>
                            <div>Moved: {summary.movedCount} files</div>
                            <div>Imports updated in: {summary.importsUpdatedCount} files</div>
                            <div>Backup: {summary.backupPath || "none"}</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ExactMakerModal;
