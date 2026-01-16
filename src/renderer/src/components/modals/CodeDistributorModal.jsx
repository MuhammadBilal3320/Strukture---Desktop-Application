import React, { useState, useEffect, useRef } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsShare } from "react-icons/bs";
import CustomToaster from "../common/CustomToaster";

const CodeDistributorModal = ({ isOpen, setIsOpen, selectedFolder }) => {
    const [inputCode, setInputCode] = useState("");
    const [fileMap, setFileMap] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pasted, setPasted] = useState(false);
    const [cleared, setCleared] = useState(false);

    const textareaRef = useRef(null);

    useEffect(() => {
        const parseFiles = () => {
            const lines = inputCode.split("\n");
            const files = [];
            let currentFile = null;
            let currentStyle = null;

            const extensions = ["js", "jsx", "ts", "tsx", "py", "html", "css", "json", "java", "c", "cpp", "txt", "md"];

            const isFileHeader = (line) => {
                const commentMatch = line.match(/^(\s*(\/\/|#|\*+|\/\*|\*).*)$/);
                if (!commentMatch) return null;

                const regex = new RegExp(`([\\w\\-_/]+\\.(${extensions.join("|")}))`, "i");
                const match = line.match(regex);
                if (match) {
                    return { fileName: match[1], style: commentMatch[2] || "//" };
                }
                return null;
            };

            for (const line of lines) {
                const header = isFileHeader(line);

                if (header) {
                    if (currentFile) files.push(currentFile);
                    currentFile = {
                        path: header.fileName.trim(),
                        content: "",
                    };
                    currentStyle = header.style;
                } else if (currentFile) {
                    currentFile.content += line + "\n";
                }
            }

            if (currentFile) files.push(currentFile);

            setFileMap(files);
        };

        parseFiles();
    }, [inputCode]);


    const generateFiles = async () => {
        if (!selectedFolder) {
            window.toastError("No project folder selected!");
            return;
        }

        if (fileMap.length === 0) {
            window.toastError("No files detected! Make sure header comments include a file path.");
            return;
        }

        setLoading(true);

        try {
            for (const file of fileMap) {
                const fullPath = `${selectedFolder}/${file.path}`;
                const folderPath = fullPath.split("/").slice(0, -1).join("/");

                const folderRes = await window.api.createFolder(folderPath);
                if (!folderRes.success) throw new Error(folderRes.error);

                const writeRes = await window.api.writeFile(fullPath, file.content);
                if (!writeRes.success) throw new Error(writeRes.error);
            }

            window.toastSuccess("Files successfully generated!");
        } catch (err) {
            console.error(err);
            window.toastError("Error generating files: " + err.message);
        }

        setLoading(false);
    };

    const handlePaste = async () => {
        if (navigator.clipboard) {
            const text = await navigator.clipboard.readText();

            setInputCode(text);

            setTimeout(() => {
                textareaRef.current?.dispatchEvent(
                    new Event("input", { bubbles: true })
                );
            }, 10);

            setPasted(true);
            window.toastSuccess("Pasted from clipboard!");
            setTimeout(() => setPasted(false), 2000);
        } else {
            window.toastError("Clipboard not supported!");
        }
    };

    const handleClear = () => {
        if (textareaRef.current) {
            textareaRef.current.value = "";
            setInputCode("");

            setCleared(true);
            window.toastSuccess("Input cleared!");
            setTimeout(() => setCleared(false), 2000);
        }
    };


    if (!isOpen) return null;

    return (
        <>
            <CustomToaster /> {/* <-- added toaster */}

            <div className="fixed inset-0 bg-[#00000049] flex justify-center items-center z-50">
                <div className="bg-[#1C1D25] w-[950px] max-h-[90vh] p-5 rounded-lg shadow-xl text-white flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="modalMainHeading-information flex items-center justify-between">
                        <h2 className="text-lg font-semibold mb-2 perfectCenter gap-2">
                            <BsShare className="text-green-400" />
                            Code Distributor
                        </h2>

                        <div>
                            <div className="group relative">
                                <button
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                                >
                                    <AiOutlineInfoCircle size={14} />
                                    <span>Information</span>
                                </button>


                                {/* Tooltip */}
                                <div className="hidden group-hover:block absolute right-1 top-7 z-10 w-[700px] bg-[#14151C] text-gray-300 text-xs p-3 rounded-md border border-gray-700 shadow-lg leading-relaxed">
                                    <div className="space-y-2">
                                        <p>
                                            This tool takes your combined project code and automatically detects file blocks,
                                            then recreates those files and folders inside the selected project directory.
                                        </p>

                                        <ul className="list-disc list-inside space-y-1 pl-1">

                                            <li>
                                                <strong>How File Detection Works:</strong>
                                                Any comment line that contains a valid file path (example: <code>src/App.js</code>)
                                                is treated as the start of a new file block. Everything below it belongs to that file.
                                            </li>

                                            <li>
                                                <strong>Supported File Types:</strong>
                                                js, jsx, ts, tsx, py, html, css, json, java, c, cpp, txt, md — and more can be added.
                                            </li>

                                            <li>
                                                <strong>Input Format Requirement:</strong>
                                                Every file section must begin with a comment that includes a file path, such as:<br />
                                                <code>// src/components/Button.jsx</code>
                                                <code># main.py</code>
                                                <code>/* styles.css */</code>
                                            </li>

                                            <li>
                                                <strong>Preview Panel:</strong>
                                                As soon as you paste code, all detected files will be listed on the right side instantly.
                                            </li>

                                            <li>
                                                <strong>Distribute Files:</strong>
                                                Clicking "Distribute Files" will:
                                                <ul className="list-disc list-inside ml-5 space-y-1">
                                                    <li>Create folders automatically if they don’t exist.</li>
                                                    <li>Write file contents into their corresponding paths.</li>
                                                    <li>Preserve your folder structure.</li>
                                                </ul>
                                            </li>

                                            <li>
                                                <strong>Clipboard Tools:</strong>
                                                Use <em>Paste</em> to import code from clipboard.
                                                Use <em>Clear</em> to instantly reset the input area.
                                            </li>

                                            <li>
                                                <strong>Performance Note:</strong>
                                                Very large combined files or many detected file blocks may take extra time to process.
                                                This depends on how many folders and files must be created.
                                            </li>

                                            <li>
                                                <strong>Recommended Workflow:</strong>
                                                <ol className="list-decimal list-inside ml-4 space-y-1">
                                                    <li>Copy your entire combined code from Code Collector.</li>
                                                    <li>Paste it into the textarea here.</li>
                                                    <li>Verify detected files on the right.</li>
                                                    <li>Select a target folder.</li>
                                                    <li>Click "Distribute Files" to rebuild your project automatically.</li>
                                                </ol>
                                            </li>

                                            <li>
                                                <strong>Reminder:</strong>
                                                Make sure the combined code actually contains valid file header comments,
                                                otherwise no files will be detected.
                                            </li>

                                        </ul>
                                    </div>
                                </div>



                            </div>
                        </div>
                    </div>


                    {/* Selected folder */}
                    <div className="mb-3">
                        <label className="text-gray-400 text-sm mb-1 block">Selected Folder</label>
                        <div className="w-full px-3 py-0.5 bg-[#14151C] border-2 border-[#50c878] rounded-full text-gray-300">
                            {selectedFolder || "No folder selected"}
                        </div>
                    </div>

                    {/* Side by side: textarea and detected files */}
                    <div className="flex max-h-[60vh] flex-1 gap-4 mb-4">
                        {/* Textarea */}
                        <div className="flex-1 flex flex-col">

                            <div className="heading-paste-clear-buttons flex items-center justify-between m-1">
                                <label className="text-gray-400 text-sm mb-1">Paste your combined code here</label>

                                <div className="clear-pasteBtns perfectCenter gap-3 mr-2">
                                    <button onClick={handlePaste}
                                        className="w-20 ring-1 perfectCenter gap-1 mr-2 px-2 py-1 text-xs bg-[#2C2F3B] text-[#81C784] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#A5D6A7] transition opacity-70 hover:opacity-100"
                                    > {pasted ? "Pasted!" : "Paste"}
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="w-20 ring-1 perfectCenter gap-1 px-2 py-1 text-xs bg-[#2C2F3B] text-[#E57373] font-semibold rounded-md shadow hover:bg-[#383C4A] hover:text-[#FF8A80] transition opacity-70 hover:opacity-100"
                                    >
                                        <span>{cleared ? "Cleared!" : "Clear"}</span>
                                    </button>
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={inputCode}
                                wrap="off"
                                spellCheck={false}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder={
                                    "Examples of file headers:\n" +
                                    "──────────────────────────────────\n" +
                                    "// src/components/Button.jsx           --> Style 1\n" +
                                    "( file content will be extracted from here )\n\n" +

                                    "# api/routes/user.py                   --> Style 2\n" +
                                    "( file content goes here )\n\n" +

                                    "/* styles/main.css */                  --> Style 3\n" +
                                    "( css content starts below )\n\n" +

                                    "* config/app.json                      --> Style 4\n" +
                                    "( json content example )\n\n" +

                                    "// backend/server.js                   --> Style 5\n" +
                                    "( server file placeholder )\n" +
                                    "──────────────────────────────────\n" +
                                    "Paste your combined project code below..."
                                }
                                className="flex-1 px-3 py-3 bg-[#14151C] outline-none border border-gray-600 rounded text-white font-mono text-sm resize-none overflow-auto min-h-[400px] whitespace-pre"
                                style={{ whiteSpace: 'pre', overflowX: 'auto' }}
                            />


                        </div>

                        {/* Detected files */}
                        <div className="w-64 flex flex-col">
                            <h3 className="text-sm font-semibold mb-2 text-blue-300">
                                {fileMap.length} file(s) detected:
                            </h3>
                            <div className="flex-1 overflow-auto border border-gray-700 p-1 text-sm rounded bg-[#14151C]">
                                <div className="flex flex-col whitespace-nowrap">
                                    {fileMap.map((f, i) => (
                                        <div key={i} className="text-gray-300">
                                            ▸ {f.path}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 mt-auto">
                        <button
                            className="px-6 py-1 text-white font-semibold ring-1 ring-[#50c878] hover:ring-black rounded-full hover:bg-black"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="px-8 py-1 text-black font-semibold bg-[#50c878] rounded-full hover:bg-[#11bb4a] flex items-center gap-2"
                            onClick={generateFiles}
                            disabled={loading}
                        >
                            {loading ? "Distributing..." : "Distribute Files"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CodeDistributorModal;
