import React, { useEffect } from "react";
import {
    BsBuildings,
    BsLayers,
    BsEye,
    BsDiagram3,
    BsShare
} from "react-icons/bs";
import { BiCommentX } from "react-icons/bi";

import Face from "../common/Face";
import CustomToaster from "../common/CustomToaster";

const buttons = [
    { icon: <BsEye />, label: "Preview Structure", action: "preview" },
    { icon: <BsDiagram3 />, label: "Generate Structure", action: "generate" },
    { icon: <BsBuildings />, label: "Create Structure", action: "create" },
    { icon: <BsLayers />, label: "Code Collector", action: "collector" },
    { icon: <BsShare />, label: "Code Distributor", action: "distributor" },
    { icon: <BiCommentX />, label: "Remove Comments", action: "removeComments" },
];

const FunctionSidebar = ({
    setPreviewOpen,
    previewOpen,
    setShowModal,
    showModal,
    selectedFolder,
    setShowCreateModal,
    showCreateModal,
    setIsCommentModalOpen,
    isCommentModalOpen,
    setIsCodeCollectorOpen,
    isCodeCollectorOpen,
    setIsCodeDistributorOpen,
    isCodeDistributorOpen,
}) => {

    useEffect(() => {
        if (!selectedFolder) {
            setShowModal(false);
            setShowCreateModal(false);
            setIsCodeCollectorOpen(false);
            setIsCodeDistributorOpen(false);
            setIsCommentModalOpen(false);
        }
    }, [
        selectedFolder,
        setShowModal,
        setShowCreateModal,
        setIsCodeCollectorOpen,
        setIsCodeDistributorOpen,
        setIsCommentModalOpen
    ]);

    const handleAction = (action) => {
        switch (action) {
            case "preview":
                setPreviewOpen(prev => !prev);
                break;

            case "generate":
                if (!selectedFolder) return window.toastError("Select a folder first");
                setShowModal(true);
                break;

            case "create":
                if (!selectedFolder) return window.toastError("Select a folder first");
                setShowCreateModal(true);
                break;

            case "collector":
                if (!selectedFolder) return window.toastError("Select a folder first");
                setIsCodeCollectorOpen(true);
                break;

            case "distributor":
                if (!selectedFolder) return window.toastError("Select a folder first");
                setIsCodeDistributorOpen(true);
                break;

            case "removeComments":
                setIsCommentModalOpen(true);
                break;

            default:
                break;
        }
    };


    return (
        <aside className="w-16 h-[100vh] border-r-1 border-gray-700 flex flex-col items-center gap-4 bg-[#14151C] py-1 shadow-lg relative">
            <Face />
            <CustomToaster />

            {buttons.map((btn, index) => {
                const isPreview = btn.action === "preview";

                // Determine active state based on modal open/close
                let isActive = false;
                if (!isPreview) {
                    if (btn.action === "generate") isActive = !!showModal;
                    else if (btn.action === "create") isActive = !!showCreateModal;
                    else if (btn.action === "collector") isActive = !!isCodeCollectorOpen;
                    else if (btn.action === "distributor") isActive = !!isCodeDistributorOpen;
                    else if (btn.action === "removeComments") isActive = !!isCommentModalOpen;
                }

                return (
                    <div key={index} className="relative w-full perfectCenter">
                        <button
                            className={`group w-full perfectCenter text-lg p-3 transition-colors 
                                ${isActive ? "text-green-400" : "text-gray-400"} 
                                hover:text-white`}
                            onClick={() => handleAction(btn.action)}
                        >
                            {btn.icon}

                            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg pointer-events-none z-50">
                                {btn.label}
                            </span>
                        </button>
                    </div>
                );
            })}
        </aside>
    );
};

export default FunctionSidebar;
