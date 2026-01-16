import React, { useState, useEffect } from "react";
import { BsFolder, BsFolderFill, BsFileEarmarkText, BsCheck, BsClipboard, BsLayers } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import CustomToaster from "../common/CustomToaster";

// Recursive TreeNode component
const TreeNode = ({ item, level = 0, toggleSelect, toggleExpand }) => {
    const hasChildren = item.children && item.children.length > 0;

    const renderIcon = () => {
        if (item.isFile)
            return <BsFileEarmarkText onDoubleClick={() => toggleSelect(item)} className="text-[#64B5F6]" />;
        if (item.selected)
            return <BsFolder onDoubleClick={() => toggleSelect(item)} className="text-red-400" />;
        return <BsFolderFill onDoubleClick={() => toggleSelect(item)} className="text-[#FFD54F]" />;
    };

    return (
        <div>
            <div
                className="flex items-center gap-1 text-white text-sm px-2 cursor-pointer hover:bg-gray-700 rounded"
                style={{ paddingLeft: level * 16 }}
            >
                {!item.isFile && (
                    <span className="w-4 inline-block text-center" onClick={() => toggleExpand(item)}>
                        {item.expanded ? "▾" : "▸"}
                    </span>
                )}

                {renderIcon()}

                <span
                    className={item.selected ? "text-red-400 italic ml-1" : "ml-1"}
                    onDoubleClick={() => toggleSelect(item)}
                >
                    {item.name}
                </span>
            </div>

            {hasChildren && item.expanded && !item.selected &&
                item.children.map((child) => (
                    <TreeNode
                        key={child.path}
                        item={child}
                        level={level + 1}
                        toggleSelect={toggleSelect}
                        toggleExpand={toggleExpand}
                    />
                ))}

            {item.selected && hasChildren && (
                <div style={{ paddingLeft: (level + 1) * 16 }} className="text-red-400 italic text-sm">
                    [selected]
                </div>
            )}
        </div>
    );
};

const CodeCollectorModal = ({ isOpen, projectPath, onClose, onConfirm }) => {
    const [rootItems, setRootItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewText, setPreviewText] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);

    // NEW: Clear Button Status
    const [clearStatus, setClearStatus] = useState("Clear");

    // Load folder contents
    const loadFolder = async (path) => {
        try {
            const result = await window.api.scanFolder(path);
            if (!result.success) return [];
            return result.items.map((item) => ({
                ...item,
                children: [],
                expanded: false,
                selected: false,
                loaded: false,
            }));
        } catch (err) {
            console.error("Error loading folder:", err);
            window.toastError("Error loading folder!");
            return [];
        }
    };

    useEffect(() => {
        if (!isOpen || !projectPath) return;
        setLoading(true);
        loadFolder(projectPath).then((items) => {
            setRootItems(items);
            setLoading(false);
            setShowPreview(false);
            setPreviewText("");
        });
    }, [isOpen, projectPath]);

    // Toggle select
    const toggleSelect = (item) => {
        const newState = !item.selected;

        const setRecursive = (node, state) => {
            node.selected = state;
            if (node.children && node.children.length > 0) {
                node.children.forEach((child) => setRecursive(child, state));
            }
        };

        setRecursive(item, newState);
        setRootItems([...rootItems]);
    };

    // Toggle expand (lazy load)
    const toggleExpand = async (item) => {
        if (!item.isFile) {
            if (!item.loaded) {
                const children = await loadFolder(item.path);
                item.children = children;
                item.loaded = true;
            }
            item.expanded = !item.expanded;
            setRootItems([...rootItems]);
        }
    };

    // Collapse all
    const handleCollapseAll = () => {
        const collapse = (nodes) => {
            nodes.forEach((n) => {
                n.expanded = false;
                if (n.children.length > 0) collapse(n.children);
            });
        };
        collapse(rootItems);
        setRootItems([...rootItems]);
    };

    // === NEW: Select All ===
    const handleSelectAll = () => {
        const selectAll = (nodes) => {
            nodes.forEach((n) => {
                n.selected = true;
                if (n.children.length > 0) selectAll(n.children);
            });
        };
        selectAll(rootItems);
        setRootItems([...rootItems]);
    };

    // === NEW: Deselect All ===
    const handleDeselectAll = () => {
        const deselectAll = (nodes) => {
            nodes.forEach((n) => {
                n.selected = false;
                if (n.children.length > 0) deselectAll(n.children);
            });
        };
        deselectAll(rootItems);
        setRootItems([...rootItems]);
    };

    // Recursively collect files
    const getAllFilesRecursively = async (item) => {
        if (item.isFile) return [item.path];

        if (!item.loaded) {
            const children = await loadFolder(item.path);
            item.children = children;
            item.loaded = true;
        }

        let files = [];
        for (const child of item.children) {
            const childFiles = await getAllFilesRecursively(child);
            files = files.concat(childFiles);
        }
        return files;
    };

    const getSelectedFiles = async (items) => {
        let files = [];
        for (const item of items) {
            if (item.selected) {
                const itemFiles = await getAllFilesRecursively(item);
                files = files.concat(itemFiles);
            } else if (item.children.length > 0) {
                const childFiles = await getSelectedFiles(item.children);
                files = files.concat(childFiles);
            }
        }
        return files;
    };

    const handleCombine = async () => {
        setLoading(true);
        const selectedFiles = await getSelectedFiles(rootItems);

        if (selectedFiles.length === 0) {
            window.toastError("Please select at least one file or folder!");
            setLoading(false);
            return;
        }

        let combined = "";
        for (const filePath of selectedFiles) {
            const res = await window.api.readFile(filePath);
            if (res.success) {
                combined += `\n\n# ===== ${filePath.split(/[\\/]/).pop()} =====\n${res.content}\n`;
            } else {
                combined += `\n\n# [Error reading ${filePath}]: ${res.error || "Unknown error"}\n`;
            }
        }

        setPreviewText(combined);
        setShowPreview(true);
        setLoading(false);
        window.toastSuccess("Files combined successfully!");
    };

    // Clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(previewText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
            window.toastSuccess("Preview copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
            window.toastError("Failed to copy to clipboard!");
        }
    };

    // === NEW: Clear Preview ===
    const handleClear = () => {
        setClearStatus("Cleared!");
        setPreviewText("");
        setShowPreview(false);

        setTimeout(() => {
            setClearStatus("Clear");
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            <CustomToaster />

            <div className="fixed inset-0 bg-[#00000054] flex justify-center items-center z-50 select-none">
                <div className="bg-[#1C1D25] w-[700px] h-[650px] border-2 border-gray-800 p-5 rounded-lg shadow-xl text-white flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BsLayers className="text-green-400" />Code Collector
                    </h2>

                    <div className="relative flex justify-end items-center gap-2 mb-3">

                        {/* LEFT SIDE - Information Button */}
                        <div className="absolute left-0">
                            <div className="group relative">
                                <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
                                    <AiOutlineInfoCircle size={14} /> Information
                                </button>


                                <div className="hidden group-hover:block absolute left-1 top-7 z-10 w-[600px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg leading-relaxed">
                                    <div className="space-y-2">
                                        <p>
                                            This modal allows you to select folders and files from the project and combine their contents into a single preview.
                                        </p>

                                        <ul className="list-disc list-inside space-y-1 pl-1">
                                            <li>
                                                <strong>Double-Click Selection:</strong> Double-click a file or folder to select it. Selecting a folder will automatically select all its children recursively.
                                            </li>

                                            <li>
                                                <strong>Folder Expansion:</strong> Click the arrow next to a folder to expand or collapse its contents. Only expanded folders show their children in the tree view.
                                            </li>

                                            <li>
                                                <strong>Select All / Deselect All:</strong> Use these buttons to quickly select or deselect all files and folders in the tree.
                                            </li>

                                            <li>
                                                <strong>Collapse All:</strong> Collapses all expanded folders to give a cleaner view of the root structure.
                                            </li>

                                            <li>
                                                <strong>Combine & View:</strong> Combines the contents of all selected files (including files inside selected folders) into a single preview for easy review or copying.
                                            </li>

                                            <li>
                                                <strong>Copy Preview:</strong> Copies the combined content to your clipboard so you can paste it elsewhere.
                                            </li>

                                            <li>
                                                <strong>Clear Preview:</strong> Clears the combined preview and resets the preview area.
                                            </li>

                                            <li>
                                                <strong>Workflow Tip:</strong>
                                                <ol className="list-decimal list-inside ml-4">
                                                    <li>Select files/folders by double-clicking or using Select All.</li>
                                                    <li>Expand folders to view contents if needed.</li>
                                                    <li>Click "Combine & View" to generate a combined preview of all selected files.</li>
                                                    <li>Use Copy to save the preview or Clear to reset.</li>
                                                </ol>
                                            </li>

                                            <li>
                                                <strong>Note:</strong> Only loaded folders can be combined. If a folder has not been expanded yet, it will be loaded automatically when combining.
                                            </li>
                                        </ul>
                                    </div>
                                </div>



                            </div>
                        </div>

                        {/* RIGHT SIDE ROW - Collapse / Select / Deselect */}
                        {!previewText && (
                            <div className="flex gap-2">
                                <button
                                    className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                    onClick={handleCollapseAll}
                                >
                                    Collapse All
                                </button>

                                <button
                                    className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                    onClick={handleSelectAll}
                                >
                                    Select All
                                </button>

                                <button
                                    className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                    onClick={handleDeselectAll}
                                >
                                    Deselect All
                                </button>
                            </div>
                        )}

                        {/* COPY + CLEAR buttons (only in preview mode) */}
                        {previewText && (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#64B5F6] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#90CAF9] transition opacity-70 hover:opacity-100"
                                >
                                    {copied ? <BsCheck /> : <BsClipboard />}
                                    <span>{copied ? "Copied!" : "Copy"}</span>
                                </button>

                                <button
                                    onClick={handleClear}
                                    className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#E57373] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#FF8A80] transition opacity-70 hover:opacity-100"
                                >
                                    {clearStatus}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex-1 border border-gray-600 rounded p-2 bg-[#14151C] overflow-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-10 h-10 border-4 border-gray-700 border-t-[#50c878] rounded-full animate-spin"></div>
                                <span className="mt-2 text-gray-300 text-sm">
                                    Processing selected files and folders...
                                </span>
                                <span className="mt-1 text-gray-400 text-xs">
                                    This may take a few moments depending on the number of items selected.
                                </span>
                                <span className="mt-1 text-gray-400 text-xs">
                                    Large folders or many files will take longer to combine.
                                </span>
                                <span className="mt-1 text-gray-400 text-xs">
                                    Please wait, do not close the modal until processing completes.
                                </span>
                            </div>
                        ) : showPreview ? (
                            <div className="whitespace-pre-wrap text-sm">{previewText}</div>
                        ) : rootItems.length > 0 ? (
                            <div className="min-w-max">
                                {rootItems.map((item) => (
                                    <TreeNode key={item.path} item={item} toggleSelect={toggleSelect} toggleExpand={toggleExpand} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center">No items found</div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] hover:ring-black rounded-full hover:bg-black"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full hover:bg-[#11bb4a]"
                            onClick={handleCombine}
                        >
                            Combine & View
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CodeCollectorModal;
