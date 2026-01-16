import React, { useState, useEffect } from "react";
import { BsFolder, BsFolderFill, BsFileEarmarkText } from "react-icons/bs";
import { FiRefreshCw } from "react-icons/fi";
import { VscCollapseAll } from "react-icons/vsc";
import ProjectAnalyzerModal from "../modals/ProjectAnalyzerModal";

// TreeNode component
const TreeNode = ({ node, level = 0, onSelect, toggleCollapse }) => {
  const hasChildren = node.children && node.children.length > 0;

  const handleExpand = async () => {
    if (node.isFile) {
      onSelect && onSelect(node.path);
      return;
    }

    toggleCollapse(node.path); // Use lifted state
  };

  const renderIcon = () => {
    if (node.isFile)
      return <BsFileEarmarkText className="text-[#64B5F6] flex-shrink-0" />;
    return node.collapsed ? (
      <BsFolder className="text-[#FFD54F] flex-shrink-0" />
    ) : (
      <BsFolderFill className="text-[#FFD54F] flex-shrink-0" />
    );
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 text-white text-sm cursor-pointer hover:bg-[#2C2F3B] px-2 rounded"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleExpand}
        title={node.name}
      >
        {renderIcon()}
        <span className="whitespace-nowrap">{node.name}</span>
      </div>

      {!node.collapsed &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            level={level + 1}
            onSelect={onSelect}
            toggleCollapse={toggleCollapse}
          />
        ))}
    </div>
  );
};




// Sidebar
const Sidebar = ({ selectedFolder, setPreviewOpen, previewOpen, setPreviewContent }) => {
  const [rootItems, setRootItems] = useState([]);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [fullTreeData, setFullTreeData] = useState("");

  useEffect(() => {
    if (!selectedFolder) return;

    window.api.scanFolderDeep(selectedFolder).then(res => {
      if (res.success) {
        setFullTreeData(res.tree);
      }
    });
  }, [selectedFolder]);


  const loadRoot = async () => {
    if (!selectedFolder) return;

    try {
      const result = await window.api.scanFolder(selectedFolder);

      if (result.success) {
        const items = result.items.map((item) => ({
          ...item,
          isFile: !!item.isFile,
          collapsed: true,
          children: [],
        }));
        setRootItems(items);
      } else {
        setRootItems([]);
      }
    } catch {
      setRootItems([]);
    }
  };

  useEffect(() => {
    loadRoot();
  }, [selectedFolder]);

  const handleFileClick = async (filePath) => {
    if (!setPreviewContent) return;

    try {
      const result = await window.api.readFile(filePath);
      if (result.success) {
        setPreviewContent(result.content);
        setPreviewOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle collapsed state for a node
  const toggleCollapse = (path) => {
    const toggle = (nodes) => {
      nodes.forEach((n) => {
        if (n.path === path) {
          n.collapsed = !n.collapsed;
          // Load children when expanding
          if (!n.collapsed && n.children.length === 0 && !n.isFile) {
            window.api.scanFolder(n.path).then((res) => {
              if (res.success) {
                n.children = res.items.map((i) => ({
                  ...i,
                  isFile: !!i.isFile,
                  collapsed: true,
                  children: [],
                }));
                setRootItems([...rootItems]);
              }
            });
          }
        } else if (n.children && n.children.length > 0) {
          toggle(n.children);
        }
      });
    };
    toggle(rootItems);
    setRootItems([...rootItems]);
  };

  // Collapse all folders
  const handleCollapseAll = () => {
    const collapseRecursive = (nodes) => {
      nodes.forEach((n) => {
        if (!n.isFile) n.collapsed = true;
        if (n.children && n.children.length > 0) collapseRecursive(n.children);
      });
    };
    collapseRecursive(rootItems);
    setRootItems([...rootItems]);
  };

  const folderName = selectedFolder
    ? selectedFolder.split(/[/\\]/).pop()
    : "No folder selected";

  return (
    <aside
      className={`w-72 bg-[#14151C] flex flex-col shadow-lg ${previewOpen ? "hidden" : ""}`}
      style={{ height: "100vh" }}
    >
      {/* Top header */}
      <div className="sticky top-0 z-10 bg-[#14151C] border-b border-[#20222A]">
        <div className="flex items-center justify-between px-3 py-4">
          <h2 className="text-white font-semibold text-sm tracking-wide">
            Project Explorer
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleCollapseAll}
              title="Collapse All"
              className="text-gray-300 hover:text-white transition"
            >
              <VscCollapseAll size={18} />
            </button>
            <button
              onClick={loadRoot}
              title="Refresh Folder"
              className="text-gray-300 hover:text-white transition"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#1A1C23] border-t border-[#20222A]">
          <p className="text-gray-400 text-[11px] font-medium truncate uppercase tracking-wide">
            {folderName}
          </p>
        </div>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-auto px-1 pb-4 mt-1">
        <div className="min-w-max">
          {selectedFolder ? (
            rootItems.length > 0 ? (
              rootItems.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  onSelect={handleFileClick}
                  toggleCollapse={toggleCollapse}
                />
              ))
            ) : (
              <p className="text-gray-500 text-xs px-3 py-2 italic">Empty folder</p>
            )
          ) : (
            <p className="text-gray-500 text-xs px-3 py-2">No folder selected</p>
          )}
        </div>
      </div>

      {selectedFolder && <ProjectAnalyzerModal open={analyzerOpen} onToggle={() => setAnalyzerOpen(!analyzerOpen)} treeData={fullTreeData} />}
    </aside>
  );
};

export default Sidebar;
