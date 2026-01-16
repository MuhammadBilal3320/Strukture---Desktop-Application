import React, { useState, useEffect } from "react";
import { BsFolder, BsFolderFill, BsFileEarmarkText, BsDiagram3 } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import CustomToaster from "../common/CustomToaster";

// Recursive TreeNode component
const TreeNode = ({ item, level = 0, toggleExclude, toggleExpand }) => {
    const hasChildren = item.children && item.children.length > 0;

    const renderIcon = () => {
        if (item.isFile)
            return (
                <BsFileEarmarkText
                    onDoubleClick={() => toggleExclude(item)}
                    className="text-[#64B5F6]"
                />
            );

        if (item.excluded)
            return (
                <BsFolder
                    onDoubleClick={() => toggleExclude(item)}
                    className="text-red-400"
                />
            );

        return (
            <BsFolderFill
                onDoubleClick={() => toggleExclude(item)}
                className="text-[#FFD54F]"
            />
        );
    };

    return (
        <div>
            <div
                className="flex items-center gap-1 text-white text-sm px-2 cursor-pointer hover:bg-gray-700 rounded"
                style={{ paddingLeft: level * 16 }}
            >
                {!item.isFile && !item.excluded && (
                    <span
                        className="w-4 inline-block text-center"
                        onClick={() => toggleExpand(item)}
                    >
                        {item.expanded ? "▾" : "▸"}
                    </span>
                )}

                {renderIcon()}

                <span
                    className={item.excluded ? "text-red-400 italic ml-1" : "ml-1"}
                    onDoubleClick={() => toggleExclude(item)}
                >
                    {item.name}
                </span>
            </div>

            {hasChildren && item.expanded && !item.excluded &&
                item.children.map((child) => (
                    <TreeNode
                        key={child.path}
                        item={child}
                        level={level + 1}
                        toggleExclude={toggleExclude}
                        toggleExpand={toggleExpand}
                    />
                ))}

            {item.excluded && hasChildren && (
                <div
                    style={{ paddingLeft: (level + 1) * 16 }}
                    className="text-red-400 italic text-sm"
                >
                    [excluded]
                </div>
            )}
        </div>
    );
};

const FolderHierarchyModal = ({ isOpen, folderPath, onClose, onConfirm }) => {
    const [rootItems, setRootItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load first level
    const loadFolderRecursive = async (path) => {
        try {
            const result = await window.api.scanFolder(path);
            if (!result.success) return [];

            const items = result.items || [];
            return items.map((item) => ({
                ...item,
                children: [],
                loaded: false,
                expanded: false,
                excluded: false,
            }));
        } catch {
            return [];
        }
    };

    useEffect(() => {
        if (!isOpen || !folderPath) return;

        setLoading(true);
        loadFolderRecursive(folderPath).then((items) => {
            setRootItems(items);
            setLoading(false);
        });
    }, [isOpen, folderPath]);

    // Toggle exclude
    const toggleExclude = (item) => {
        item.excluded = !item.excluded;
        setRootItems([...rootItems]);
    };

    // Expand/collapse loader
    const toggleExpand = async (item) => {
        if (!item.isFile && !item.excluded) {
            if (!item.loaded) {
                try {
                    const result = await window.api.scanFolder(item.path);

                    if (result.success) {
                        const items = result.items || [];

                        item.children = items.map((i) => ({
                            ...i,
                            children: [],
                            loaded: false,
                            expanded: false,
                            excluded: false,
                        }));

                        item.loaded = true;
                        window.toastSuccess(`Loaded: ${item.name}`);
                    }
                } catch {
                    window.toastError("Failed to load folder!");
                }
            }

            item.expanded = !item.expanded;
            setRootItems([...rootItems]);
        }
    };

    // Collapse all
    const handleCollapseAll = () => {
        const collapseRecursive = (nodes) => {
            nodes.forEach((n) => {
                n.expanded = false;
                if (n.children.length > 0) collapseRecursive(n.children);
            });
        };

        collapseRecursive(rootItems);
        setRootItems([...rootItems]);
        window.toastSuccess("Collapsed all folders");
    };

    // Select All
    const handleDeselectAll = () => {
        const apply = (nodes) => {
            nodes.forEach((n) => {
                n.excluded = false;
                if (n.children.length) apply(n.children);
            });
        };
        apply(rootItems);
        setRootItems([...rootItems]);
        window.toastSuccess("All items Deselected");
    };

    // Deselect All
    const handleSelectAll = () => {
        const apply = (nodes) => {
            nodes.forEach((n) => {
                n.excluded = true;
                if (n.children.length) apply(n.children);
            });
        };
        apply(rootItems);
        setRootItems([...rootItems]);
        window.toastSuccess("All items Selected");
    };

    // Collect excluded paths
    const getExcludedPaths = (items) => {
        const excluded = new Set();

        const traverse = (nodes) => {
            nodes.forEach((node) => {
                if (node.excluded) {
                    excluded.add(node.path);
                } else if (node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };

        traverse(items);
        return excluded;
    };

    // Generate text
    const generateText = (items, prefix = "") => {
        let result = "";

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const connector = isLast ? "└── " : "├── ";

            result += `${prefix}${connector}${item.name}\n`;

            if (item.excluded) {
                result += prefix + (isLast ? "    " : "│   ") + "└── [excluded]\n";
            } else if (item.children.length > 0) {
                result += generateText(
                    item.children,
                    prefix + (isLast ? "    " : "│   ")
                );
            }
        });

        return result;
    };

    // Generate Current View (only expanded)
    const handleGenerateCurrentView = () => {
        const rootName = folderPath.split(/[\\/]/).pop();
        const structure = `${rootName}/\n${generateText(rootItems)}`;
        onConfirm(structure);

        window.toastSuccess("Generated Current View");
        onClose();
    };

    // Build full tree generator
    const buildFullStructure = async (path, excludedPaths) => {
        try {
            const result = await window.api.scanFolder(path);
            if (!result.success) return [];

            const items = result.items || [];
            const structure = [];

            for (const item of items) {
                const isExcluded = excludedPaths.has(item.path);

                if (item.isFile) {
                    structure.push({
                        ...item,
                        children: [],
                        excluded: isExcluded,
                    });
                } else {
                    if (isExcluded) {
                        structure.push({
                            ...item,
                            children: [],
                            excluded: true,
                        });
                    } else {
                        const subTree = await buildFullStructure(
                            item.path,
                            excludedPaths
                        );
                        structure.push({
                            ...item,
                            children: subTree,
                            excluded: false,
                        });
                    }
                }
            }

            return structure;
        } catch {
            window.toastError("Error generating full structure");
            return [];
        }
    };

    // Full Output
    const handleGenerateFullOutput = async () => {
        setLoading(true);

        const excludedPaths = getExcludedPaths(rootItems);
        const fullTree = await buildFullStructure(folderPath, excludedPaths);

        setLoading(false);

        const rootName = folderPath.split(/[\\/]/).pop();
        const structure = `${rootName}/\n${generateText(fullTree)}`;

        onConfirm(structure);
        window.toastSuccess("Generated Full Output");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <CustomToaster />

            <div className="fixed inset-0 bg-[#00000054] flex justify-center items-center z-90 select-none">
                <div className="bg-[#1C1D25] w-[700px] h-[650px] border-2 border-gray-800 p-5 rounded-lg shadow-xl text-white flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BsDiagram3 className="text-green-400" />
                        Generate Folder Structure
                    </h2>

                    {/* Controls */}
                    <div className="relative flex justify-end items-center gap-2 mb-3">

                        {/* Info Left */}
                        <div className="absolute left-0">
                            <div className="group relative">
                                <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
                                    <AiOutlineInfoCircle size={14} />
                                    <span>Information</span>
                                </button>


                                <div className="hidden group-hover:block absolute left-1 top-7 z-10 w-[600px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg leading-relaxed">
                                    <div className="space-y-2">

                                        <p className="text-[11px] text-gray-400">
                                            This panel allows you to build a custom folder tree by expanding folders, excluding items, and generating structure outputs.
                                        </p>

                                        <ul className="list-disc list-inside space-y-1 pl-1">

                                            <li>
                                                <strong>Double-Click to Exclude / Include</strong>
                                                — Double-click any file or folder to mark it as <em>excluded</em>.
                                                Excluded items appear in red, are ignored in the output, and their children are also excluded.
                                            </li>

                                            <li>
                                                <strong>Select All</strong>
                                                — Marks every item as excluded. This hides everything from the final output unless you manually include items again.
                                            </li>

                                            <li>
                                                <strong>Deselect All</strong>
                                                — Clears all exclusions and restores all files and folders to normal.
                                            </li>

                                            <li>
                                                <strong>Collapse All</strong>
                                                — Closes all expanded folders. This affects only the view; it does not change exclusions.
                                            </li>

                                            <li>
                                                <strong>Generate Current View</strong>
                                                — Generates the folder structure <em>exactly as you see it right now</em>.
                                                Only expanded folders are included. Collapsed folders are not scanned or shown.
                                            </li>

                                            <li>
                                                <strong>Generate Full Output</strong>
                                                — Scans the entire directory recursively and generates a full, complete folder tree.
                                                Every folder is included except those you explicitly excluded.
                                            </li>

                                            <li>
                                                <strong>Important Difference</strong>:
                                                <em>Current View = only expanded folders.</em>
                                                <em>Full Output = entire directory.</em>
                                            </li>

                                            <li>
                                                <strong>Workflow Tip</strong>
                                                — Expand only the folders you want to preview and use “Generate Current View”,
                                                or use “Generate Full Output” for a complete automatic structure.
                                            </li>
                                        </ul>
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* ✨ Option B Order */}
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

                        <button
                            className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                            onClick={handleCollapseAll}
                        >
                            Collapse All
                        </button>

                        <button
                            className="px-2 py-1 bg-[#50c878] text-black font-semibold rounded text-xs hover:bg-[#18e75d]"
                            onClick={handleGenerateCurrentView}
                        >
                            Generate Current View
                        </button>
                       

                    </div>

                    {/* Folder Tree */}
                    <div className="flex-1 border border-gray-600 rounded p-2 bg-[#14151C] overflow-y-auto overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <div className="w-10 h-10 border-4 border-gray-700 border-t-[#50c878] rounded-full animate-spin"></div>
                                <span className="mt-2 text-gray-300 text-sm text-center">
                                    Loading folder hierarchy... <br />
                                    Depending on folder size, this may take a little time.
                                </span>
                            </div>
                        ) : rootItems.length > 0 ? (
                            <div className="min-w-max">
                                {rootItems.map((item) => (
                                    <TreeNode
                                        key={item.path}
                                        item={item}
                                        toggleExclude={toggleExclude}
                                        toggleExpand={toggleExpand}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center">
                                No items found
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-4">

                        <button
                            className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] hover:ring-black rounded-full hover:bg-black"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        {/* New: Generate Full Output moved here */}
                        <button
                            className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full hover:bg-[#11bb4a]"
                            onClick={handleGenerateFullOutput}
                        >
                            Generate Full Output
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
};

export default FolderHierarchyModal;
