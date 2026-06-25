import { useState, useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../../context/AuthContext";
import { createRole, updateRole, getDatasets } from "../../../services/adminApi";
import { getDomains } from "../../domain/api/domainApi";

// Import DatasetPermissionSelector from UserCreateForm
import DatasetPermissionSelector from "./DatasetPermissionSelector";

function Toggle({ checked, onChange, label, description }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={clsx(
                "flex items-center justify-between cursor-pointer p-4 rounded-lg border-2 transition-all duration-200",
                checked
                    ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
        >
            <div className="flex-1">
                <span className={clsx(
                    "text-sm font-medium transition-colors",
                    checked ? "text-blue-900" : "text-gray-900"
                )}>
                    {label}
                </span>
                {description && (
                    <p className={clsx(
                        "text-xs mt-0.5 transition-colors",
                        checked ? "text-blue-600" : "text-gray-500"
                    )}>
                        {description}
                    </p>
                )}
            </div>
            <div
                className={clsx(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    checked ? "bg-blue-600" : "bg-gray-300"
                )}
            >
                <span
                    className={clsx(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                        checked ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </div>
        </div>
    );
}

export default function RoleCreateForm({ editingRole, onRoleCreated, onCancel }) {
    const { sessionId } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        datasetEtlAccess: false,
        queryAiAccess: false,
        datasetAccess: [],
        allDatasets: false,
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [datasets, setDatasets] = useState([]);
    const [datasetsLoading, setDatasetsLoading] = useState(true);

    // Fetch datasets on mount
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const data = await getDatasets();
                setDatasets(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch datasets:', err);
                setDatasets([]);
            } finally {
                setDatasetsLoading(false);
            }
        };
        fetchDatasets();
    }, []);

    // Load editing role data
    useEffect(() => {
        if (editingRole) {
            setFormData({
                name: editingRole.name,
                description: editingRole.description || "",
                datasetEtlAccess: editingRole.dataset_etl_access || false,
                queryAiAccess: editingRole.query_ai_access || false,
                datasetAccess: editingRole.dataset_access || [],
                allDatasets: editingRole.all_datasets || false,
            });
            setErrors({});
            setSuccessMessage("");
        } else {
            setFormData({
                name: "",
                description: "",
                datasetEtlAccess: false,
                queryAiAccess: false,
                datasetAccess: [],
                allDatasets: false,
            });
            setErrors({});
            setSuccessMessage("");
        }
    }, [editingRole]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "역할 이름을 입력해주세요";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                dataset_etl_access: formData.datasetEtlAccess,
                query_ai_access: formData.queryAiAccess,
                dataset_access: formData.allDatasets ? [] : formData.datasetAccess,
                all_datasets: formData.allDatasets,
            };

            let data;
            if (editingRole) {
                // Update existing role
                data = await updateRole(sessionId, editingRole.id, payload);
            } else {
                // Create new role
                data = await createRole(sessionId, payload);
            }

            onRoleCreated(data);

            if (!editingRole) {
                setFormData({
                    name: "",
                    description: "",
                    datasetEtlAccess: false,
                    queryAiAccess: false,
                    datasetAccess: [],
                    allDatasets: false,
                });
                setSuccessMessage("역할을 생성했습니다");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Edit Mode Header */}
            {editingRole && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                        수정 중: <strong>{editingRole.name}</strong>
                    </p>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            취소
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* Role Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                역할 이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="예: 데이터 분석가"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                설명
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="이 역할의 목적을 설명하세요..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200" />

                    {/* Permissions */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-gray-700" />
                            <h3 className="text-sm font-semibold text-gray-900">
                                권한
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            이 역할의 사용자가 접근할 수 있는 범위를 설정합니다
                        </p>

                        <div className="space-y-4">
                            {/* Dataset/ETL Access Toggle */}
                            <Toggle
                                checked={formData.datasetEtlAccess}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, datasetEtlAccess: value }))
                                }
                                label="데이터 통합/실행 접근"
                                description="데이터 통합과 실행/모니터링 화면에 접근할 수 있습니다"
                            />

                            {/* Query/AI Access Toggle */}
                            <Toggle
                                checked={formData.queryAiAccess}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, queryAiAccess: value }))
                                }
                                label="AI Query 접근"
                                description="/query 화면과 AI 도우미 버튼에 접근할 수 있습니다"
                            />

                            {/* Dataset Access */}
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">
                                            데이터셋 접근 권한
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            이 역할의 사용자가 접근할 수 있는 데이터셋을 선택합니다
                                        </p>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.allDatasets}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    allDatasets: e.target.checked,
                                                    datasetAccess: [],
                                                }))
                                            }
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">전체 데이터셋</span>
                                    </label>
                                </div>

                                {!formData.allDatasets && (
                                    <DatasetPermissionSelector
                                        datasets={datasets}
                                        selectedDatasets={formData.datasetAccess}
                                        onChange={(selected) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                datasetAccess: selected,
                                            }))
                                        }
                                    />
                                )}

                                {formData.allDatasets && (
                                    <div className="py-6 text-center text-sm text-blue-600 bg-blue-50 rounded-lg border border-blue-100">
                                        이 역할의 사용자는 모든 데이터셋에 접근할 수 있습니다
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div>
                        {errors.submit && (
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingRole ? "변경사항 저장" : "역할 생성"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
