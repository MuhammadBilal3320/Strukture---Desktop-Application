import React, { useState } from "react";

//Layout
import MainArea from "./components/layout/MainArea";
import Sidebar from "./components/layout/Sidebar";
import FunctionSidebar from "./components/layout/FunctionSidebar";

// Modals
import FolderHierarchyModal from "./components/modals/FolderHierarchyModal";
import CreateStructureModal from "./components/modals/CreateStructureModal";
import CommentsRemoverModal from "./components/modals/CommentsRemoverModal";
import CodeCollectorModal from "./components/modals/CodeCollectorModal";
import CodeDistributorModal from "./components/modals/CodeDistributorModal";

function App() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isCodeCollectorOpen, setIsCodeCollectorOpen] = useState(false);
  const [isCodeDistributorOpen, setIsCodeDistributorOpen] = useState(false);


  return (
    <div className="flex flex-col h-screen bg-[#1e1e28] text-[#e0e0e0] overflow-hidden">

      <div className="flex flex-1 gap-2 bg-[#1A1C28]">
        <div className="function-sidebar flex">
          <FunctionSidebar
            selectedFolder={selectedFolder}
            previewOpen={previewOpen} setPreviewOpen={setPreviewOpen}
            currentValue={currentValue} setCurrentValue={setCurrentValue}
            showModal={showModal} setShowModal={setShowModal}
            showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal}
            isCommentModalOpen={isCommentModalOpen} setIsCommentModalOpen={setIsCommentModalOpen}
            isCodeCollectorOpen={isCodeCollectorOpen} setIsCodeCollectorOpen={setIsCodeCollectorOpen}
            isCodeDistributorOpen={isCodeDistributorOpen} setIsCodeDistributorOpen={setIsCodeDistributorOpen}
          />

          <Sidebar
            selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}
            previewOpen={previewOpen}
          />
        </div>
        <MainArea
          setPreviewOpen={setPreviewOpen}
          setSelectedFolder={setSelectedFolder} selectedFolder={selectedFolder}
          currentValue={currentValue} setCurrentValue={setCurrentValue}
        />
      </div>

      {/* Generate Structure Modal */}
      {showModal && selectedFolder && (
        <FolderHierarchyModal
          isOpen={showModal}
          folderPath={selectedFolder}
          onClose={() => setShowModal(false)}
          onConfirm={(structure) => {
            setCurrentValue(structure);
            setShowModal(false);
          }}
        />
      )}

      {/* Create Structure Modal */}
      {showCreateModal && selectedFolder && (
        <CreateStructureModal
          isOpen={showCreateModal}
          basePath={selectedFolder}
          onClose={() => setShowCreateModal(false)}
          currentValue={currentValue}
        />
      )}

      <CommentsRemoverModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        currentValue={currentValue}
      />

      {/* Code Collector */}
      <CodeCollectorModal
        isOpen={isCodeCollectorOpen}
        onClose={() => setIsCodeCollectorOpen(false)}
        projectPath={selectedFolder}
        setCurrentValue={setCurrentValue}
      />

      {/* Code Distributor Modal */}
      <CodeDistributorModal
        isOpen={isCodeDistributorOpen}
        setIsOpen={setIsCodeDistributorOpen}
        currentValue={currentValue}
        selectedFolder={selectedFolder}
      />

    </div>
  );
}

export default App;
