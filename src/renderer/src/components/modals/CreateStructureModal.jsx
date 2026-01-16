import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsFolder, BsFileEarmarkText, BsBuildings } from "react-icons/bs";
import { FaTrash, FaPaste } from "react-icons/fa";
import CustomToaster from "../common/CustomToaster";

const CreateStructureModal = ({ isOpen, basePath, onClose, onSuccess, currentValue }) => {
  const [structureText, setStructureText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);

  const [isCleared, setIsCleared] = useState(false);
  const [isPasted, setIsPasted] = useState(false);

  // =============================
  // PASTE
  // =============================
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setStructureText(text);
      handleTextChange(text);
      setIsPasted(true);
      window.toastSuccess("Pasted successfully!");
      setTimeout(() => setIsPasted(false), 1500);
    } catch (err) {
      console.error("Paste failed", err);
      window.toastError("Failed to paste!");
    }
  };

  // =============================
  // CLEAR
  // =============================
  const handleClear = () => {
    setStructureText("");
    setPreview([]);
    setIsCleared(true);
    window.toastSuccess("Cleared!");
    setTimeout(() => setIsCleared(false), 1500);
  };

  // ============================================================
  // ✅ FIXED PARSER (THIS IS THE CORE FIX)
  // ============================================================
  const parseStructure = (text) => {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const items = [];
    const stack = [];

    let rootName = null;

    lines.forEach((line, index) => {
      // Count indentation by groups of 4 characters
      const indentMatch = line.match(/^(\s{4}|\│\s{3})*/);
      const indentStr = indentMatch ? indentMatch[0] : "";
      const depth = Math.floor(indentStr.length / 4);

      // Clean tree symbols
      const clean = line
        .replace(/^(\s|\│)+/, "")
        .replace(/(├──|└──)\s*/g, "")
        .trim();

      if (!clean) return;

      const isFile =
        clean.includes(".") &&
        !clean.endsWith("/") &&
        !clean.startsWith(".");

      // ROOT
      if (index === 0) {
        rootName = clean.replace(/\/$/, "");
        stack.length = 0;
        stack.push(rootName);

        items.push({
          name: rootName,
          isFile: false,
          level: 0,
          fullPath: rootName
        });
        return;
      }

      // Maintain hierarchy correctly
      stack.length = depth + 1;
      stack[depth + 1] = clean;

      items.push({
        name: clean,
        isFile,
        level: depth + 1,
        fullPath: stack.join("/")
      });
    });

    return items;
  };



  const handleTextChange = (text) => {
    setStructureText(text);
    try {
      setPreview(parseStructure(text));
    } catch {
      setPreview([]);
    }
  };

  // ============================================================
  // CREATE FILES / FOLDERS
  // ============================================================
  const handleCreate = async () => {
    if (!basePath || !structureText.trim()) {
      window.toastError("Structure text missing!");
      return;
    }

    setLoading(true);

    try {
      const items = parseStructure(structureText);
      let created = 0;
      let failed = 0;

      for (const item of items) {
        const fullPath = `${basePath}/${item.fullPath}`;

        try {
          if (item.isFile) {
            await window.api.createFile(fullPath);
          } else {
            await window.api.createFolder(fullPath);
          }
          created++;
        } catch (err) {
          failed++;
          console.error("Create failed:", fullPath, err);
        }
      }

      if (created > 0 && failed === 0) {
        window.toastSuccess(`Created ${created} items successfully!`);
      } else if (created > 0 && failed > 0) {
        window.toastWarning(`Created ${created}, failed ${failed}`);
      } else {
        window.toastError("No items were created!");
      }


      setStructureText("");
      setPreview([]);
    } catch (err) {
      console.error("Error:", err);
      window.toastError("Failed to create structure!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setStructureText(currentValue || "");
  }, [currentValue, isOpen]);

  if (!isOpen) return null;


  return (
    <>
      <CustomToaster /> {/* ✅ Toaster Rendered */}

      <div className="fixed inset-0 bg-[#00000046] bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-[#1C1D25] w-[800px] h-[650px] p-5 rounded-lg shadow-xl text-white overflow-hidden flex flex-col">

          <div className="modalMainHeading-information flex items-center justify-between">
            <h2 className="text-lg font-semibold mb-2 perfectCenter gap-2">
              <BsBuildings className="text-green-400" />Create Folder Structure
            </h2>

            <div className="group relative">
              <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
                <AiOutlineInfoCircle size={14} />
                <span>Information</span>
              </button>


              <div className="hidden group-hover:block absolute right-1 top-7 z-10 w-[600px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg leading-relaxed">
                <div className="space-y-2">
                  <p>
                    This modal allows you to paste, preview, and create a folder structure inside the selected base path.
                  </p>

                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>
                      <strong>Paste Folder Structure:</strong> Use the "Paste" button to paste a folder tree from your clipboard. You can also type it manually in the text area.
                    </li>

                    <li>
                      <strong>Clear:</strong> Resets the text input and preview panel completely.
                    </li>

                    <li>
                      <strong>File vs Folder Detection:</strong> Any line ending with "/" is considered a folder, otherwise it is treated as a file.
                    </li>

                    <li>
                      <strong>Preview Panel:</strong> Displays a live preview of all files and folders with their levels and full paths. Indentation represents the hierarchy.
                    </li>

                    <li>
                      <strong>Create Structure:</strong> Generates the actual folders and files inside the selected base path. Only items visible in the preview (or pasted) will be created.
                    </li>

                    <li>
                      <strong>Base Path:</strong> The root folder where your structure will be created. Ensure you have proper permissions for this folder.
                    </li>

                    <li>
                      <strong>Workflow Tip:</strong>
                      <ol className="list-decimal list-inside ml-4">
                        <li>Paste or type your folder structure.</li>
                        <li>Verify the structure in the preview panel.</li>
                        <li>Use Clear if you need to reset the input.</li>
                        <li>Click "Create Structure" to generate folders and files.</li>
                      </ol>
                    </li>

                    <li>
                      <strong>Limitations:</strong> Only basic hierarchy is supported. Nested levels should be properly indented with spaces. Ensure proper slashes for folders.
                    </li>
                  </ul>
                </div>
              </div>


            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm mb-1">Creating in:</label>
            <div className="w-full px-3 py-0.5 bg-[#14151C] border-2 border-[#50c878] rounded-full text-gray-300">
              {basePath || "No path selected"}
            </div>
          </div>

          <div className="pasteStucture-preview flex w-full gap-3 flex-1 min-h-0">

            {/* Structure Input */}
            <div className="flex-1 flex flex-col min-h-0">

              <div className="flex items-center justify-between">
                <label className="block text-sm mb-1">Paste Folder Structure</label>

                <div className="flex gap-4 m-1">

                  <button
                    className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] 
                    text-[#E57373] font-semibold rounded-md shadow hover:bg-[#383C4A] 
                    hover:text-[#FF8A80] transition opacity-70 hover:opacity-100 
                    flex items-center justify-center"
                    onClick={handleClear}
                    disabled={!structureText}
                  >
                    <FaTrash size={12} />
                    {isCleared ? "Cleared" : "Clear"}
                  </button>

                  {!preview.length > 0 && (
                    <button
                      className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] 
                      text-[#81C784] font-semibold rounded-md shadow hover:bg-[#383C4A] 
                      hover:text-[#A5D6A7] transition opacity-70 hover:opacity-100 
                      flex items-center justify-center"
                      onClick={handlePaste}
                    >
                      <FaPaste size={12} />
                      {isPasted ? "Pasted" : "Paste"}
                    </button>
                  )}

                </div>
              </div>

              <textarea
                value={structureText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#14151C] outline-none border border-gray-600 rounded text-white 
               font-mono text-sm resize-none whitespace-pre"
                placeholder={`Paste your project structure here (without comments).\nIf your structure contains comments, please use the "Remove Comments" feature first.\n\nExample:\nmy-project/\n│\n├── src/\n│   ├── components/\n│   └── App.jsx\n├── public/\n└── package.json`}
              />

            </div>

            {preview.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-sm m-1">
                  Preview ({preview.length} items)
                </label>

                <div className="flex-1 overflow-y-auto border border-gray-600 rounded p-2 bg-[#14151C]">
                  {preview.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs py-0.5"
                      style={{ paddingLeft: item.level * 16 }}
                    >
                      {item.isFile ? (
                        <BsFileEarmarkText className="text-[#64B5F6]" />
                      ) : (
                        <BsFolder className="text-[#FFD54F]" />
                      )}
                      <span className="truncate">{item.fullPath}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] hover:ring-black 
              rounded-full hover:bg-black"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full 
              hover:bg-[#11bb4a]"
              onClick={handleCreate}
            >
              {loading ? "Creating..." : "Create Structure"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CreateStructureModal;
