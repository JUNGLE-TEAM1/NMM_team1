import { useState, useMemo, useEffect } from "react";
import { Search, Edit2, Trash2, Check, X, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getRoles, deleteRole } from "../../../services/adminApi";

function AccessBadge({ hasAccess }) {
    return hasAccess ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            <Check className="w-3 h-3" />
            허용
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
            <X className="w-3 h-3" />
            차단
        </span>
    );
}

export default function RoleManagement({ onEditRole, onAddRole }) {
    const { sessionId } = useAuth();
    const [roles, setRoles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch roles from API
    const fetchRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRoles(sessionId);
            setRoles(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [sessionId]);

    const filteredRoles = useMemo(() => {
        return roles.filter(
            (role) =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [roles, searchQuery]);

    const handleDeleteRole = async (role) => {
        if (!window.confirm(`"${role.name}" 역할을 삭제할까요?`)) {
            return;
        }

        try {
            await deleteRole(sessionId, role.id);
            // Remove from local state
            setRoles((prev) => prev.filter((r) => r.id !== role.id));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">역할을 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                오류: {error}
                <button
                    onClick={fetchRoles}
                    className="ml-4 text-red-700 underline"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Add Button */}
            <div className="flex items-center justify-between">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="역할 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={onAddRole}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    역할 추가
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                역할
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                소스/구축/실행
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AI Query
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                데이터셋
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                생성일
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                작업
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRoles.map((role) => (
                            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {role.name}
                                        </p>
                                        {role.description && (
                                            <p className="text-xs text-gray-500">{role.description}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <AccessBadge hasAccess={role.dataset_etl_access} />
                                </td>
                                <td className="px-4 py-3">
                                    <AccessBadge hasAccess={role.query_ai_access} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-600">
                                        {role.dataset_access && role.dataset_access.length > 0
                                            ? `데이터셋 ${role.dataset_access.length}개`
                                            : "없음"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-500">
                                        {role.created_at ? new Date(role.created_at).toLocaleDateString() : "-"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => onEditRole(role)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="수정"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRole(role)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRoles.length === 0 && (
                    <div className="px-4 py-12 text-center text-gray-500 text-sm">
                        {searchQuery ? "검색된 역할이 없습니다." : "아직 역할이 없습니다."}
                    </div>
                )}
            </div>
        </div>
    );
}
