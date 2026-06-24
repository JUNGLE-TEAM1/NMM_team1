import React, { useState, useEffect } from "react";
import {
    ChevronRight,
    ChevronLeft,
    Info,
    BarChart3,
    GitBranch,
    ShieldCheck,
    Save,
    Lock,
    Eye,
    Users,
} from "lucide-react";
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
    isGoldDataset = false,
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState("info");
    const [departmentAccess, setDepartmentAccess] = useState({
        marketing: true,
        product: true,
        sales: false,
        finance: false,
    });
    const [governanceSettings, setGovernanceSettings] = useState({
        maskCustomerIdentifiers: true,
        monthlyAggregateOnly: true,
        allowPreviewExport: false,
    });

    // Use external state if provided, otherwise use internal state
    const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
    const setActiveTab = externalSetActiveTab || setInternalActiveTab;

    // Quality State
    const [qualityResult, setQualityResult] = useState(null);
    const [qualityHistory, setQualityHistory] = useState([]);
    const [qualityLoading, setQualityLoading] = useState(false);
    const [runningCheck, setRunningCheck] = useState(false);
    const { showToast } = useToast();
    const departmentOptions = [
        { id: "marketing", label: "마케팅팀", description: "캠페인/상품군별 매출 분석" },
        { id: "product", label: "프로덕트팀", description: "상품 성과와 카테고리 매출 확인" },
        { id: "sales", label: "세일즈팀", description: "고객군별 매출 추이 확인" },
        { id: "finance", label: "재무팀", description: "월별 매출 집계 검토" },
    ];
    const governanceOptions = [
        {
            id: "maskCustomerIdentifiers",
            label: "고객 식별자 마스킹 유지",
            description: "부서 열람 시 고객 ID와 원본 주문 식별 정보를 비식별 상태로 제공합니다.",
            icon: Lock,
        },
        {
            id: "monthlyAggregateOnly",
            label: "월별 집계 결과만 공개",
            description: "원본 주문 행이 아니라 월별 상품 매출 Gold Dataset 단위로만 열람하게 합니다.",
            icon: BarChart3,
        },
        {
            id: "allowPreviewExport",
            label: "미리보기 내보내기 허용",
            description: "선택한 부서가 샘플 미리보기 결과를 내려받을 수 있게 허용합니다.",
            icon: Eye,
        },
    ];

    const toggleDepartmentAccess = (id) => {
        setDepartmentAccess((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleGovernanceSetting = (id) => {
        setGovernanceSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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

                {isGoldDataset && (
                    <>
                        <div className="w-6 border-b border-gray-300" />

                        <button
                            onClick={() => setActiveTab("governance")}
                            title="거버넌스"
                            className={`group flex flex-col items-center justify-center w-10 py-4 rounded-lg transition-all gap-2 ${activeTab === "governance"
                                ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-blue-100"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-[10px] font-medium tracking-wide">
                                정책
                            </span>
                        </button>
                    </>
                )}

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

                    {activeTab === "governance" && isGoldDataset && (
                        <div>
                            <div className="px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">거버넌스 설정</h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Gold Dataset을 열람할 부서와 공개 범위를 설정합니다
                                </p>
                            </div>

                            <div className="p-5 space-y-6">
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <h4 className="text-xs font-semibold text-gray-900">부서별 열람 허용</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {departmentOptions.map((dept) => (
                                            <label
                                                key={dept.id}
                                                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={departmentAccess[dept.id]}
                                                    onChange={() => toggleDepartmentAccess(dept.id)}
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-gray-900">{dept.label}</span>
                                                    <span className="mt-0.5 block text-xs leading-5 text-gray-500">{dept.description}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="mb-3">
                                        <h4 className="text-xs font-semibold text-gray-900">공유 정책</h4>
                                        <p className="mt-1 text-xs text-gray-500">
                                            데이터셋 공개 시 적용할 보호 설정입니다.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {governanceOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <label
                                                    key={option.id}
                                                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 transition-colors hover:border-blue-300"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={governanceSettings[option.id]}
                                                        onChange={() => toggleGovernanceSetting(option.id)}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white text-blue-600">
                                                        <Icon className="w-4 h-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                                                        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{option.description}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>

                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <p className="text-sm font-bold text-green-900">공개 준비 완료</p>
                                    <p className="mt-1 text-xs leading-5 text-green-700">
                                        선택한 부서에는 월별 상품 매출 Gold Dataset과 허용된 미리보기 범위만 노출됩니다.
                                    </p>
                                    <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">
                                        <Save className="w-4 h-4" />
                                        설정 저장
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
