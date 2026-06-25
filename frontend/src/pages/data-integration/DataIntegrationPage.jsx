import { useState } from "react";
import { ArrowRight, Database, Plus, Table2, Workflow } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ETLPage from "../etl/etl_main";
import ConnectionListPage from "../sources/ConnectionListPage";
import NewPipelineStartModal from "./NewPipelineStartModal";

const startSteps = [
  {
    title: "소스 연결",
    description: "기존 연결 선택 또는 새 연결 생성",
    icon: Database,
  },
  {
    title: "원본 데이터",
    description: "테이블, 컬렉션, 경로, 토픽 선택",
    icon: Table2,
  },
  {
    title: "파이프라인 구성",
    description: "선택한 원본으로 캔버스 시작",
    icon: Workflow,
  },
];

export default function DataIntegrationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isManagingConnections =
    searchParams.get("manage") === "connections" || searchParams.get("tab") === "sources";
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);

  const openConnectionManager = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("tab");
    nextParams.set("manage", "connections");
    setSearchParams(nextParams);
  };

  const closeConnectionManager = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("tab");
    nextParams.delete("manage");
    setSearchParams(nextParams);
  };

  const handlePipelineStart = (selection) => {
    setShowNewPipelineModal(false);
    navigate("/etl/visual", {
      state: {
        startFromScratch: true,
        pipelineStart: selection,
      },
    });
  };

  return (
    <div className="-m-4 min-h-[calc(100vh-4rem)] bg-gray-50 sm:-m-6 lg:-m-8">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">데이터 통합</h1>
            <p className="mt-1 text-sm text-gray-500">
              파이프라인을 만들고, 필요한 경우 연결을 보조 관리합니다.
            </p>
          </div>

          {isManagingConnections ? (
            <button
              type="button"
              onClick={closeConnectionManager}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              파이프라인 목록
            </button>
          ) : (
            <button
              type="button"
              onClick={openConnectionManager}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Database className="h-4 w-4" />
              연결 관리
            </button>
          )}
        </div>
      </div>

      {!isManagingConnections && (
        <section className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Plus className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  새 파이프라인 시작
                </h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {startSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700 ring-1 ring-gray-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900">
                            {step.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:self-end">
              <button
                type="button"
                onClick={() => setShowNewPipelineModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                소스 선택하고 시작
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={openConnectionManager}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Database className="h-4 w-4" />
                연결 관리
              </button>
            </div>
          </div>
        </section>
      )}

      {isManagingConnections ? (
        <ConnectionListPage embedded />
      ) : (
        <ETLPage
          embedded
          hideCreateButton
          onCreatePipeline={() => setShowNewPipelineModal(true)}
        />
      )}

      <NewPipelineStartModal
        isOpen={showNewPipelineModal}
        onClose={() => setShowNewPipelineModal(false)}
        onManageConnections={() => {
          setShowNewPipelineModal(false);
          openConnectionManager();
        }}
        onProceed={handlePipelineStart}
      />
    </div>
  );
}
