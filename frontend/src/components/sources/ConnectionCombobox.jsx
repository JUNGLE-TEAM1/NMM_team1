import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Combobox from '../common/Combobox';
import ConfirmationModal from '../common/ConfirmationModal';

/**
 * Connection 선택 Combobox (Combobox 확장)
 * - 생성/삭제 액션 포함
 * - ConfirmationModal 내장
 */
export default function ConnectionCombobox({
    connections = [],
    selectedId,
    isLoading = false,
    placeholder = '연결 선택',
    onSelect,
    onCreate,
    onDelete,
    classNames,
}) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const pendingConnection = connections.find(c => c.id === pendingDeleteId);

    const handleDeleteClick = (e, connectionId) => {
        e.stopPropagation();
        setPendingDeleteId(connectionId);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (pendingDeleteId) {
            onDelete?.(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    return (
        <>
            <Combobox
                options={connections}
                value={selectedId}
                onChange={onSelect}
                getKey={(conn) => conn.id}
                getLabel={(conn) => `${conn.name} (${conn.type})`}
                placeholder={placeholder}
                isLoading={isLoading}
                emptyMessage="사용 가능한 연결이 없습니다"
                renderItem={(conn) => (
                    <>
                        <span className="text-sm text-gray-900 truncate">
                            {conn.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                            ({conn.type})
                        </span>
                    </>
                )}
                classNames={classNames}
                renderItemActions={(conn) => (
                    onDelete && (
                        <button
                            onClick={(e) => handleDeleteClick(e, conn.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="연결 삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )
                )}
                footerContent={
                    onCreate && (
                        <button
                            onClick={onCreate}
                            className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">새 연결 생성</span>
                        </button>
                    )
                }
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPendingDeleteId(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="연결 삭제"
                message={`"${pendingConnection?.name}" 연결을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
                confirmText="삭제"
                cancelText="취소"
                variant="danger"
            />
        </>
    );
}
