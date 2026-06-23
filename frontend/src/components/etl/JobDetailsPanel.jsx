import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Clock, Zap, Database } from 'lucide-react';


export default function JobDetailsPanel({
    jobDetails,
    onUpdate,
    jobId,
    streamingGroupId,
}) {
    const [description, setDescription] = useState('');
    const [maxRetries, setMaxRetries] = useState(0);
    const [jobType, setJobType] = useState('batch'); // 'batch' or 'cdc'
    const [incrementalEnabled, setIncrementalEnabled] = useState(false);
    const [timestampColumn, setTimestampColumn] = useState('');

    useEffect(() => {
        if (jobDetails) {
            setDescription(jobDetails.description || '');
            setMaxRetries(jobDetails.maxRetries || 0);
            setJobType(jobDetails.jobType || 'batch');

            // Hydrate incremental config
            const incConfig = jobDetails.incremental_config || {};
            setIncrementalEnabled(incConfig.enabled || false);
            setTimestampColumn(incConfig.timestamp_column || '');
        }
    }, [jobDetails]);

    const handleTypeChange = (newType) => {
        setJobType(newType);
        handleChange({ jobType: newType });
    };

    // Helper to merge updates with all current state
    const handleChange = (updates) => {
        // Since updates might be partial, we need to construct the full incremental_config object
        // if it's not provided in the updates.

        let nextIncConfig = {
            enabled: incrementalEnabled,
            timestamp_column: timestampColumn
        };

        if (updates.incremental_config) {
            nextIncConfig = updates.incremental_config;
        }

        const newDetails = {
            description: updates.description ?? description,
            jobType: updates.jobType ?? jobType,
            maxRetries: updates.maxRetries ?? maxRetries,
            incremental_config: nextIncConfig
        };
        onUpdate(newDetails);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Basic Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {jobType === "streaming" && (
                            <div className="grid grid-cols-1 gap-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Kafka Group ID
                                </label>
                                <div className="text-sm text-gray-900 break-all">
                                    {streamingGroupId || (jobId ? `xflow-stream-${jobId}` : "-")}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                설명
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    handleChange({ description: e.target.value });
                                }}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="이 ETL 작업이 하는 일을 설명하세요..."
                            />
                        </div>
                    </div>
                </div>

                {/* Job Type Selection Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Database className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">작업 유형</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Batch Option */}
                            <button
                                onClick={() => handleTypeChange('batch')}
                                className={`relative flex items-start p-4 border-2 rounded-lg transition-all text-left cursor-pointer ${jobType === 'batch'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex-1">
                                    <span className={`block font-medium ${jobType === 'batch' ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        배치 ETL
                                    </span>
                                    <span className="block text-sm text-gray-500 mt-1">
                                        스케줄 또는 수동으로 전체 데이터 처리
                                    </span>
                                </div>
                                {jobType === 'batch' && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            {/* CDC Option */}
                            <button
                                onClick={() => handleTypeChange('cdc')}
                                className={`relative flex items-start p-4 border-2 rounded-lg transition-all text-left cursor-pointer ${jobType === 'cdc'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${jobType === 'cdc' ? 'text-green-700' : 'text-gray-700'
                                            }`}>
                                            CDC (스트리밍)
                                        </span>
                                        <Zap className={`w-4 h-4 ${jobType === 'cdc' ? 'text-green-500' : 'text-yellow-500'
                                            }`} />
                                    </div>
                                    <span className="block text-sm text-gray-500 mt-1">
                                        실시간으로 변경사항만 S3에 동기화
                                    </span>
                                </div>
                                {jobType === 'cdc' && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
                            타입을 선택한 후 <strong>저장</strong> 버튼을 눌러야 적용됩니다.
                            {jobType === 'cdc' && ' CDC 선택 시 저장과 함께 실시간 동기화가 시작됩니다.'}
                        </p>
                    </div>
                </div>

                {/* Incremental Load Settings */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">증분 적재 전략</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center h-5">
                                <input
                                    id="incremental-mode"
                                    type="checkbox"
                                    checked={incrementalEnabled}
                                    onChange={(e) => {
                                        const enabled = e.target.checked;
                                        setIncrementalEnabled(enabled);
                                        handleChange({
                                            incremental_config: {
                                                enabled: enabled,
                                                timestamp_column: timestampColumn
                                            }
                                        });
                                    }}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="incremental-mode" className="font-medium text-gray-700">
                                    증분 적재 사용
                                </label>
                                <p className="text-sm text-gray-500">
                                    타임스탬프 컬럼을 기준으로 신규 데이터만 처리합니다. (워터마크 전략)
                                </p>
                            </div>
                        </div>

                        {incrementalEnabled && (
                            <div className="pl-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    타임스탬프 컬럼명
                                </label>
                                <input
                                    type="text"
                                    value={timestampColumn}
                                    onChange={(e) => {
                                        setTimestampColumn(e.target.value);
                                        handleChange({
                                            incremental_config: {
                                                enabled: true,
                                                timestamp_column: e.target.value
                                            }
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: updated_at, created_at"
                                />
                                <p className="mt-2 text-xs text-gray-400">
                                    이 컬럼이 소스 테이블/컬렉션에 존재하고 비교 가능한 타임스탬프 값을 담고 있어야 합니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Execution Settings Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">실행 설정</h3>
                    </div>
                    <div className="p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                최대 재시도 횟수
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={maxRetries}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        setMaxRetries(value);
                                        handleChange({ maxRetries: value });
                                    }}
                                    className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-500">회</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                작업 실패 시 다시 시도할 횟수입니다. (0-10)
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
