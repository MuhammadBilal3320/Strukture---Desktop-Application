# Strukture

**Strukture** is a desktop developer productivity tool built to **analyze, collect, generate, clean, and reconstruct codebases and folder structures** with speed and accuracy. It is designed for modern workflows involving **AI-assisted development, project sharing, refactoring, and rapid reconstruction** from text-based inputs.


## 🚀 What is Strukture?

Strukture helps developers turn complex projects into **portable, editable text formats** and back again—without losing structure.  
Whether you're sharing code with AI, documenting a project, rebuilding a structure, or cleaning source files, Strukture streamlines the entire process.


## ✨ Core Features

### 📦 Code Collector
- Browse projects using an interactive folder tree
- Expand folders lazily for performance
- Include or exclude files and folders visually
- Combine selected files into a **single formatted output**
- Automatically inserts file path headers
- One-click copy to clipboard

**Use case:**  
Share entire or partial codebases with AI tools or teammates in one clean format.


### 🧱 Folder Structure Generator
- Scan folders interactively or recursively
- Expand folders on demand
- Double-click to exclude/include files or folders
- Generate outputs in two modes:
  - **Current View** – only expanded folders
  - **Full Output** – entire directory recursively
- Outputs clean, tree-style folder structures

**Use case:**  
Create accurate project structures for documentation, AI prompts, or rebuilding later.

### 🔄 Structure Creator
- Paste a folder tree structure as plain text
- Live preview of detected files and folders
- Correct hierarchy parsing using indentation and tree symbols
- Automatically recreates:
  - Folders
  - Empty files
- Safe validation before writing to disk

**Use case:**  
Rebuild an entire project structure from a text description or AI-generated output.


### 🧹 Comment Remover
- Removes comments without breaking code
- Supported formats:
  - `//` (JavaScript, Java, C++)
  - `#` (Python, YAML)
  - `/* */` (multi-line)
  - `<!-- -->` (HTML/XML)
- Preserves formatting and code layout

**Use case:**  
Prepare clean code for production, analysis, or AI input.


### 📊 Project Analyzer
- Instantly analyzes project statistics
- Displays:
  - Total files
  - Total folders
  - Project size
  - Total lines of code
- Detailed breakdown by file extension
- Lazy-loaded file lists
- Automatically ignores common folders:
  - `node_modules`
  - `.git`
  - `dist`, `build`, `.next`, `.vscode`

**Use case:**  
Understand project complexity and composition at a glance.


## 🧠 Recommended Workflow

1. Open a project in **Strukture**
2. Analyze it using **Project Analyzer**
3. Generate or preview folder structures
4. Collect selected files into a single output
5. Clean code if needed using Comment Remover
6. Share or modify the output (AI / team)
7. Rebuild the full project using Structure Creator

## 🛠 Supported File Types

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Python (`.py`)
- HTML / CSS
- JSON
- Markdown / Text
- Any text-based source files


## 🖥 Tech Stack

- React
- Electron (Desktop Application)
- Node.js File System APIs
- Tailwind-based Dark UI
- Native OS & Clipboard integration


## ⚠️ Notes & Limitations

- Large projects may take time to scan
- Folder indentation must be consistent for structure parsing
- Tree headers must include file paths when rebuilding:
  ```js
  // src/components/Button.jsx
