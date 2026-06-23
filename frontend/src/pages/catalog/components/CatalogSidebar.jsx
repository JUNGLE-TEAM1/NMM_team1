import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Info, BarChart3, GitBranch } from "lucide-react";
import { useToast } from "../../../components/common/Toast/ToastContext";
import {
    getLatestQualityResult,
    getQualityHistory,
    runQualityCheck,
} from "../../domain/api/domainApi";
import { CatalogInfoTab } from "./CatalogInfoTab";
import { CatalogQualityTab } from "./CatalogQualityTab";
import { CatalogStreamTab } from "./CatalogStreamTab";

export const CatalogSidebar = ({
    isOpen,
    setIsOpen,
    catalogItem,
    targetPath,
    selectedNode,
    lineageData,
    onNavigateToNode,
    activeTab: externalActiveTab,
    setActiveTab: externalSetActiveTab,
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState("info");

    // Use external state if provided, otherwise use internal state
    const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
    const setActiveTab = externalSetActiveTab || setInternalActiveTab;

    // Quality State
    const [qualityResult, setQualityResult] = useState(null);
    const [qualityHistory, setQualityHistory] = useState([]);
    const [qualityLoading, setQualityLoading] = useState(false);
    const [runningCheck, setRunningCheck] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        let isActive = true;

        const fetchQualityData = async () => {
            if (!catalogItem?.id) return;

            setQualityLoading(true);
            try {
                const [latest, history] = await Promise.all([
                    getLatestQualityResult(catalogItem.id).catch(() => null),
                    getQualityHistory(catalogItem.id, 5).catch(() => []),
                ]);
                if (!isActive) return;
                setQualityResult(latest);
                setQualityHistory(history);
            } catch (error) {
                console.error("Failed to fetch quality data:", error);
            } finally {
                if (isActive) setQualityLoading(false);
            }
        };

        fetchQualityData();

        return () => {
            isActive = false;
        };
    }, [catalogItem?.id]);

    const handleRunQualityCheck = async () => {
        const s3Path =
            catalogItem?.destination?.path ||
            catalogItem?.target?.path ||
            catalogItem?.target;

        if (!s3Path) {
            showToast("이 데이터셋에 설정된 S3 경로가 없습니다", "error");
            return;
        }

        setRunningCheck(true);
        try {
            const result = await runQualityCheck(catalogItem.id, s3Path, {
                jobId: catalogItem.id,
            });
            setQualityResult(result);
            setQualityHistory((prev) => [result, ...prev.slice(0, 4)]);
            showToast(
                `품질 검사가 완료되었습니다. 점수: ${result.overall_score}`,
                "success"
            );
        } catch (error) {
            console.error("Failed to run quality check:", error);
            showToast("품질 검사를 실행하지 못했습니다", "error");
        } finally {
            setRunningCheck(false);
        }
    };

    return (
        <>
            {/* Vertical Tab Strip - Always Visible */}
            <div className="w-14 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-6 gap-4 shrink-0 relative">
                <button
                    onClick={() => setActiveTab("info")}
                    title="정보"
                    className={`group flex flex-col items-center justify-center w-10 py-4 rounded-lg transition-all gap-2 ${activeTab === "info"
                        ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Info className="w-5 h-5" />
                    <span className="text-[10px] font-medium tracking-wide">정보</span>
                </button>

                <div className="w-6 border-b border-gray-300" />

                <button
                    onClick={() => setActiveTab("quality")}
                    title="품질"
                    className={`group flex flex-col items-center justify-center w-10 py-4 rounded-lg transition-all gap-2 ${activeTab === "quality"
                        ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-[10px] font-medium tracking-wide">
                        품질
                    </span>
                </button>

                <div className="w-6 border-b border-gray-300" />

                <button
                    onClick={() => setActiveTab("stream")}
                    title="흐름"
                    className={`group flex flex-col items-center justify-center w-10 py-4 rounded-lg transition-all gap-2 ${activeTab === "stream"
                        ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <GitBranch className="w-5 h-5" />
                    <span className="text-[10px] font-medium tracking-wide">
                        흐름
                    </span>
                </button>

                {/* Toggle Button - Attached to Tab Strip */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all z-30"
                    title={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                >
                    {isOpen ? (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Content Area - Slides In/Out */}
            <div
                className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${isOpen ? "w-80" : "w-0"
                    } overflow-hidden`}
            >
                <div className="w-80 h-full overflow-y-auto bg-white">
                    {activeTab === "info" && (
                        <CatalogInfoTab
                            catalogItem={catalogItem}
                            targetPath={targetPath}
                            selectedNode={selectedNode}
                        />
                    )}

                    {activeTab === "quality" && (
                        <CatalogQualityTab
                            qualityResult={qualityResult}
                            qualityLoading={qualityLoading}
                            runningCheck={runningCheck}
                            onRunQualityCheck={handleRunQualityCheck}
                        />
                    )}

                    {activeTab === "stream" && (
                        <CatalogStreamTab
                            lineageData={lineageData}
                            selectedNode={selectedNode}
                            onNavigateToNode={onNavigateToNode}
                        />
                    )}
                </div>
            </div>
        </>
    );
};
