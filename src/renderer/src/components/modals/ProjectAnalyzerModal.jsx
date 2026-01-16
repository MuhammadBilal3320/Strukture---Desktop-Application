import React, { useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import {
    FaFolder,
    FaFileAlt,
    FaDatabase,
    FaListUl,
    FaSpinner
} from "react-icons/fa";


const IGNORED = ["node_modules", ".git", "dist", "build", ".next", ".vscode"];

const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ProjectAnalyzerModal = ({ open, onToggle, treeData, analyzing }) => {
    const [expanded, setExpanded] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const stats = useMemo(() => {
        const result = {
            files: 0,
            folders: 0,
            size: 0,
            lines: 0,
            extensions: {}
        };

        const walk = (nodes = []) => {
            for (const node of nodes) {
                if (IGNORED.includes(node.name)) continue;

                if (node.isFile) {
                    const ext = node.name.includes(".")
                        ? node.name.split(".").pop().toLowerCase()
                        : "other";

                    const size = node.size || 0;
                    const lines = node.lines || 0;

                    result.files++;
                    result.size += size;
                    result.lines += lines;

                    if (!result.extensions[ext]) {
                        result.extensions[ext] = {
                            files: 0,
                            size: 0,
                            lines: 0,
                            items: []
                        };
                    }

                    result.extensions[ext].files++;
                    result.extensions[ext].size += size;
                    result.extensions[ext].lines += lines;

                    result.extensions[ext].items.push({
                        name: node.name,
                        size,
                        lines
                    });
                } else {
                    result.folders++;
                    node.children && walk(node.children);
                }
            }
        };

        if (treeData?.length) walk(treeData);
        return result;
    }, [treeData]);

    return (
        <div className={`border-t ${open ? "border-green-400" : "border-[#212229]"}`}>
            {/* HEADER */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2 px-3 py-1 text-sm font-semibold hover:bg-[#23242e]"
            >
                {open ? <FaChevronDown /> : <FaChevronRight />}
                Project Analyzer
            </button>

            <div
                className="transition-all duration-300 overflow-hidden"
                style={{ maxHeight: open ? "420px" : "0px" }}
            >
                <div className="px-3 py-2 text-xs text-gray-300 max-h-[380px] overflow-y-auto space-y-3">

                    {/* LOADING */}
                    {analyzing && (
                        <div className="text-center text-gray-400 animate-pulse py-4">
                            🔍 Analyzing project...
                        </div>
                    )}

                    {!analyzing && (
                        <>
                            {/* SUMMARY */}
                            <div className="bg-[#1F2230] rounded p-2 space-y-1">
                                {analyzing ? (
                                    <>
                                        <div className="flex justify-between items-center text-gray-400 animate-pulse">
                                            <span className="flex items-center gap-1">
                                                <FaFolder /> Folders
                                            </span>
                                            <FaSpinner className="animate-spin" />
                                        </div>

                                        <div className="flex justify-between items-center text-gray-400 animate-pulse">
                                            <span className="flex items-center gap-1">
                                                <FaFileAlt /> Files
                                            </span>
                                            <FaSpinner className="animate-spin" />
                                        </div>

                                        <div className="flex justify-between items-center text-gray-400 animate-pulse">
                                            <span className="flex items-center gap-1">
                                                <FaDatabase /> Size
                                            </span>
                                            <FaSpinner className="animate-spin" />
                                        </div>

                                        <div className="flex justify-between items-center text-gray-400 animate-pulse">
                                            <span className="flex items-center gap-1">
                                                <FaListUl /> Lines
                                            </span>
                                            <FaSpinner className="animate-spin" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1">
                                                <FaFolder /> Folders
                                            </span>
                                            <span>{stats.folders}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1">
                                                <FaFileAlt /> Files
                                            </span>
                                            <span>{stats.files}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1">
                                                <FaDatabase /> Size
                                            </span>
                                            <span>{formatSize(stats.size)}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1">
                                                <FaListUl /> Lines
                                            </span>
                                            <span>{stats.lines}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* TOGGLE TABLE */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowTable(prev => !prev)}
                                    className="text-[11px] text-blue-400 hover:underline"
                                >
                                    {showTable ? "Hide details" : "Show details"}
                                </button>
                            </div>

                            {/* TABLE (LAZY LOADED) */}
                            {showTable && (
                                <>
                                    {/* TABLE HEADER */}
                                    <div className="grid grid-cols-4 px-2 py-1 text-[11px] bg-[#1C1F2B] font-semibold rounded-t">
                                        <span>Type</span>
                                        <span className="text-right">Files</span>
                                        <span className="text-right">Lines</span>
                                        <span className="text-right">Size</span>
                                    </div>

                                    <div className="border border-[#2A2D3A] border-t-0 rounded-b">
                                        {Object.entries(stats.extensions).map(([ext, data]) => (
                                            <div key={ext} className="border-t border-[#2A2D3A]">
                                                <button
                                                    onClick={() =>
                                                        setExpanded(expanded === ext ? null : ext)
                                                    }
                                                    className="grid grid-cols-4 px-2 py-1 w-full text-[11px] hover:bg-[#1C1F2B]"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {expanded === ext ? <FaChevronDown /> : <FaChevronRight />}
                                                        .{ext}
                                                    </span>
                                                    <span className="text-right">{data.files}</span>
                                                    <span className="text-right">{data.lines}</span>
                                                    <span className="text-right">{formatSize(data.size)}</span>
                                                </button>

                                                {/* LAZY FILE LIST */}
                                                {expanded === ext && (
                                                    <div className="bg-[#171822] px-3 py-2 space-y-1">
                                                        {data.items.map((f, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex justify-between text-[11px] text-gray-400"
                                                            >
                                                                <span className="truncate max-w-[65%]">
                                                                    {f.name}
                                                                </span>
                                                                <span className="text-[10px]">
                                                                    {f.lines} (Lines)
                                                                </span>
                                                                <span>{formatSize(f.size)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalyzerModal;
