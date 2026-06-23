import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { connectionApi } from '../../services/connectionApi';
import ConnectionForm from '../sources/ConnectionForm';
import ConnectionCombobox from '../sources/ConnectionCombobox';
import Combobox from '../common/Combobox';
import { useToast } from '../common/Toast/ToastContext';

export default function MongoDBSourcePropertiesPanel({ node, selectedMetadataItem, onClose, onUpdate, onMetadataUpdate }) {
    const { showToast } = useToast();
    const [connections, setConnections] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [inferredSchema, setInferredSchema] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isInferring, setIsInferring] = useState(false);

    // Load connections and restore node-specific data when node changes
    useEffect(() => {
        loadConnections();
    }, [node?.id]);

    useEffect(() => {
        if (selectedConnection) {
            loadCollections(selectedConnection.id);
        }
    }, [selectedConnection]);

    // Restore node data when switching between nodes
    useEffect(() => {
        if (connections.length > 0 && node?.data?.sourceId) {
            const prevConn = connections.find(c => c.id === node.data.sourceId);
            if (prevConn) {
                setSelectedConnection(prevConn);
                setSelectedCollection(node.data.collectionName || '');
                setInferredSchema(node.data.schema || []);
                // Restore selected fields
                if (node.data.schema) {
                    setSelectedFields(node.data.schema.map(f => f.field));
                }
            } else {
                resetState();
            }
        } else if (connections.length > 0 && !node?.data?.sourceId) {
            resetState();
        }
    }, [node?.id, connections]);

    const resetState = () => {
        setSelectedConnection(null);
        setSelectedCollection('');
        setCollections([]);
        setInferredSchema([]);
        setSelectedFields([]);
    };

    const loadConnections = async () => {
        try {
            setIsConnectionsLoading(true);
            const data = await connectionApi.fetchConnections();
            // Filter only MongoDB connections
            const mongoConnections = data.filter(c => c.type === 'mongodb');
            setConnections(mongoConnections);
        } catch (err) {
            console.error('연결 목록 불러오기 실패:', err);
            showToast('연결 목록을 불러오지 못했습니다', 'error');
        } finally {
            setIsConnectionsLoading(false);
        }
    };

    const loadCollections = async (connectionId) => {
        try {
            setLoading(true);
            const data = await connectionApi.fetchMongoDBCollections(connectionId);
            setCollections(data.collections || []);
        } catch (err) {
            console.error('컬렉션 목록 불러오기 실패:', err);
            showToast('컬렉션 목록을 불러오지 못했습니다', 'error');
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInferSchema = async () => {
        if (!selectedConnection || !selectedCollection) {
            showToast('먼저 연결과 컬렉션을 선택해주세요', 'warning');
            return;
        }

        try {
            setIsInferring(true);
            const schema = await connectionApi.fetchCollectionSchema(
                selectedConnection.id,
                selectedCollection,
                1000 // Sample size
            );
            setInferredSchema(schema);

            // Auto-save immediately
            onUpdate({
                sourceId: selectedConnection.id,
                sourceName: selectedConnection.name,
                sourceType: 'mongodb',
                collectionName: selectedCollection,
                schema: schema
            });

            showToast(`스키마를 추론해 저장했습니다 (${schema.length}개 필드)`, 'success');
        } catch (err) {
            console.error('스키마 추론 실패:', err);
            showToast('스키마 추론에 실패했습니다', 'error');
        } finally {
            setIsInferring(false);
        }
    };

    const handleSave = () => {
        if (selectedConnection && selectedCollection && inferredSchema.length > 0) {
            // Filter to only selected fields
            const selectedSchema = inferredSchema.filter(f => selectedFields.includes(f.field));

            onUpdate({
                sourceId: selectedConnection.id,
                sourceName: selectedConnection.name,
                sourceType: 'mongodb',
                collectionName: selectedCollection,
                schema: selectedSchema
            });
            showToast('MongoDB 소스를 저장했습니다', 'success');
        } else {
            showToast('연결 선택, 컬렉션 선택, 스키마 추론을 모두 완료해주세요', 'warning');
        }
    };

    const handleCreateSuccess = async (newConnection) => {
        setShowCreateModal(false);
        await loadConnections();
        if (newConnection && newConnection.type === 'mongodb') {
            setSelectedConnection(newConnection);
        }
    };

    const handleMetadataChange = (field, value) => {
        if (selectedMetadataItem && onMetadataUpdate) {
            onMetadataUpdate({
                ...selectedMetadataItem,
                [field]: value
            });
        }
    };

    const toggleFieldSelection = (field) => {
        setSelectedFields(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            } else {
                return [...prev, field];
            }
        });
    };

    const toggleAllFields = () => {
        if (selectedFields.length === inferredSchema.length) {
            setSelectedFields([]);
        } else {
            setSelectedFields(inferredSchema.map(f => f.field));
        }
    };

    return (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    MongoDB 소스 속성
                </h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        노드 라벨
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        value={node?.data?.label || 'MongoDB 소스'}
                        disabled
                    />
                </div>

                {/* Connection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        MongoDB 연결
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        MongoDB 연결을 선택하세요.
                    </p>
                    <ConnectionCombobox
                        connections={connections}
                        selectedId={selectedConnection?.id}
                        isLoading={isConnectionsLoading}
                        placeholder="MongoDB 연결 선택"
                        onSelect={(conn) => {
                            setSelectedConnection(conn);
                            setSelectedCollection('');
                            setCollections([]);
                            setInferredSchema([]);
                            setSelectedFields([]);
                        }}
                        onCreate={() => setShowCreateModal(true)}
                        onDelete={async (connectionId) => {
                            try {
                                await connectionApi.deleteConnection(connectionId);
                                setConnections((prev) => prev.filter((c) => c.id !== connectionId));
                                if (selectedConnection?.id === connectionId) {
                                    resetState();
                                }
                                showToast('연결을 삭제했습니다', 'success');
                            } catch (err) {
                                console.error('연결 삭제 실패:', err);
                                showToast('연결 삭제에 실패했습니다', 'error');
                            }
                        }}
                    />
                </div>

                {/* Collection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        컬렉션 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        처리할 MongoDB 컬렉션을 선택하세요.
                    </p>
                    <Combobox
                        options={collections}
                        value={selectedCollection}
                        onChange={(collection) => {
                            setSelectedCollection(collection);
                            setInferredSchema([]);
                            setSelectedFields([]);
                        }}
                        getKey={(collection) => collection}
                        getLabel={(collection) => collection}
                        placeholder="컬렉션 선택"
                        isLoading={loading}
                        disabled={!selectedConnection}
                        emptyMessage="사용 가능한 컬렉션이 없습니다"
                    />
                </div>

                {/* Infer Schema Button */}
                {selectedCollection && (
                    <div>
                        <button
                            onClick={handleInferSchema}
                            disabled={isInferring}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isInferring ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    스키마 추론 중...
                                </>
                            ) : (
                                '스키마 추론 (샘플 문서 1000개)'
                            )}
                        </button>
                    </div>
                )}

                {/* Metadata Edit Section */}
                {selectedMetadataItem && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {selectedMetadataItem.type === 'collection' ? `컬렉션: ${selectedMetadataItem.name}` : `필드: ${selectedMetadataItem.name}`}
                                {selectedMetadataItem.type === 'field' && selectedMetadataItem.dataType && (
                                    <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                        {selectedMetadataItem.dataType}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                설명
                            </label>
                            <input
                                type="text"
                                value={selectedMetadataItem.description || ''}
                                onChange={(e) => handleMetadataChange('description', e.target.value)}
                                placeholder="설명을 입력하세요..."
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                태그
                            </label>
                            <input
                                type="text"
                                value={typeof selectedMetadataItem.tags === 'string' ? selectedMetadataItem.tags : (selectedMetadataItem.tags || []).join(', ')}
                                onChange={(e) => {
                                    // Just update the display value, don't parse yet
                                    handleMetadataChange('tags', e.target.value);
                                }}
                                onBlur={(e) => {
                                    // On blur, parse the comma-separated tags
                                    const tagsString = typeof selectedMetadataItem.tags === 'string'
                                        ? selectedMetadataItem.tags
                                        : (selectedMetadataItem.tags || []).join(', ');
                                    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
                                    handleMetadataChange('tags', tags);
                                }}
                                placeholder="태그 추가 (쉼표로 구분)"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Create Connection Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-6">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-bold text-gray-900">MongoDB 연결 만들기</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                <ConnectionForm
                                    onSuccess={handleCreateSuccess}
                                    onCancel={() => setShowCreateModal(false)}
                                    defaultType="mongodb"
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
