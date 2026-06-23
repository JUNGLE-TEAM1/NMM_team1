import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, Info, Server, Trash2 } from 'lucide-react';
import { connectionApi } from '../../services/connectionApi';
import { useToast } from '../../components/common/Toast/ToastContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function ConnectionListPage() {
    const { openToast } = useToast();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const data = await connectionApi.fetchConnections();
            setConnections(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteModal = (id) => {
        setPendingDeleteId(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDeleteId) return;

        try {
            await connectionApi.deleteConnection(pendingDeleteId);
            setConnections(prev => prev.filter(c => c.id !== pendingDeleteId));
            openToast({ message: '연결을 삭제했습니다', type: 'success' });
        } catch (err) {
            openToast({ message: '연결을 삭제하지 못했습니다', type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setPendingDeleteId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">연결 관리</h1>
            </div>

            {/* Create Connection Button */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">새 연결 생성</h2>
                    <Info className="w-5 h-5 text-gray-400" />
                </div>

                <button
                    onClick={() => navigate('/sources/new')}
                    className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-md flex items-start gap-4"
                >
                    <Server className="w-8 h-8 text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">새 연결</h3>
                        <p className="text-sm text-gray-600">
                            PostgreSQL, MySQL, S3, MongoDB 등에 연결합니다.
                        </p>
                    </div>
                </button>
            </div>

            {/* Connections List */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                            내 연결 ({connections.length})
                        </h2>
                        <Info className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-500">불러오는 중...</p>
                    </div>
                ) : error ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-red-500">오류: {error}</p>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <div className="max-w-md mx-auto">
                            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                연결이 없습니다
                            </h3>
                            <p className="text-gray-600 mb-6">
                                아직 생성한 연결이 없습니다.
                            </p>
                            <button
                                onClick={() => navigate('/sources/new')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                첫 연결 만들기
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        이름
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        유형
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상세 정보
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {connections.map((conn) => (
                                    <tr key={conn.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {conn.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase font-semibold">
                                                {conn.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {conn.type === 's3'
                                                ? `버킷: ${conn.config?.bucket}`
                                                : `${conn.config?.host}:${conn.config?.port}`
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${conn.status === 'connected'
                                                    ? 'bg-green-100 text-green-800'
                                                    : conn.status === 'fail' || conn.status === 'error'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {conn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenDeleteModal(conn.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPendingDeleteId(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="연결 삭제"
                message="이 연결을 삭제할까요? 이 작업은 되돌릴 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
                variant="danger"
            />
        </div>
    );
}
