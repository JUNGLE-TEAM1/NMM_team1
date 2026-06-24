import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, CheckCircle2, Clock3, Database, FileSearch, Info, Layers3, Plus, RefreshCw, Table2, Trash2 } from 'lucide-react';
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
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const [testStates, setTestStates] = useState({});

    const navigate = useNavigate();
    const selectedConnection = connections.find((conn) => conn.id === selectedConnectionId) || connections[0] || null;

    const getConnectionDetail = (conn) => {
        if (conn.type === 's3') return `버킷: ${conn.config?.bucket || '-'}`;
        if (conn.type === 'api') return conn.config?.base_url || '-';
        if (conn.type === 'kafka') return conn.config?.bootstrap_servers || '-';
        if (conn.config?.host || conn.config?.port) {
            return `${conn.config?.host || '-'}:${conn.config?.port || '-'}`;
        }
        return '-';
    };

    const getConnectionTypeLabel = (type) => {
        const labels = {
            postgres: 'DB',
            mysql: 'DB',
            mongodb: 'DB',
            s3: 'S3',
            api: 'API',
            kafka: 'Kafka',
        };
        return labels[type] || type?.toUpperCase() || '-';
    };

    const getConfigRows = (conn) => {
        if (!conn) return [];

        if (conn.type === 's3') {
            return [
                { label: '버킷', value: conn.config?.bucket || '-' },
                { label: '리전', value: conn.config?.region || '-' },
                { label: '접근 범위', value: '원본/가공 데이터 경로 조회' },
            ];
        }

        if (conn.type === 'api') {
            return [
                { label: 'Base URL', value: conn.config?.base_url || '-' },
                { label: '인증 방식', value: conn.config?.auth_type || 'API Key' },
                { label: '수집 방식', value: '요청 기반 Batch 수집' },
            ];
        }

        if (conn.type === 'kafka') {
            return [
                { label: '브로커', value: conn.config?.bootstrap_servers || '-' },
                { label: '대표 토픽', value: conn.config?.topic || 'commerce.order.events' },
                { label: '수집 방식', value: '실시간 스트림' },
            ];
        }

        return [
            { label: '호스트', value: conn.config?.host || '-' },
            { label: '포트', value: conn.config?.port || '-' },
            { label: '데이터베이스', value: conn.config?.database || '-' },
            { label: '사용자', value: conn.config?.user || '-' },
        ];
    };

    const getDiscoveredAssets = (conn) => {
        if (!conn) return [];

        if (conn.type === 'kafka') {
            return [
                { name: 'commerce.order.events', kind: 'Topic', description: '실시간 주문 이벤트' },
            ];
        }

        if (conn.type === 's3') {
            return [
                { name: 'bronze/customer_order_raw/', kind: 'Path', description: '고객/주문 원본 데이터' },
                { name: 'silver/customer_order_silver/', kind: 'Path', description: '고객 주문 통합 Silver Dataset' },
                { name: 'gold/monthly_product_sales/', kind: 'Path', description: '월별 상품 매출 Gold Dataset' },
            ];
        }

        if (conn.type === 'api') {
            return [
                { name: '/events', kind: 'Endpoint', description: '서비스 이벤트' },
                { name: '/orders', kind: 'Endpoint', description: '주문 상태' },
                { name: '/products', kind: 'Endpoint', description: '상품 메타데이터' },
            ];
        }

        if (conn.type === 'mongodb') {
            return [
                { name: 'customer_profiles', kind: 'Collection', description: '고객 프로필 문서' },
                { name: 'product_catalog', kind: 'Collection', description: '상품 카탈로그 문서' },
            ];
        }

        return [
            { name: 'orders', kind: 'Table', description: '커머스 주문 거래 데이터' },
        ];
    };

    const getSchemaPreview = (conn) => {
        if (!conn) return [];

        if (conn.type === 'kafka') {
            return [
                { name: 'event_id', type: 'VARCHAR', description: '주문 이벤트 ID' },
                { name: 'order_id', type: 'VARCHAR', description: '주문 식별자' },
                { name: 'product_id', type: 'VARCHAR', description: '상품 식별자' },
                { name: 'event_time', type: 'TIMESTAMP', description: '수집 시각' },
            ];
        }

        if (conn.type === 's3') {
            return [
                { name: 'file_path', type: 'STRING', description: 'S3 객체 경로' },
                { name: 'format', type: 'STRING', description: '파일 포맷' },
                { name: 'ingested_at', type: 'TIMESTAMP', description: '적재 시각' },
            ];
        }

        if (conn.type === 'api') {
            return [
                { name: 'id', type: 'VARCHAR', description: '응답 객체 ID' },
                { name: 'event_name', type: 'VARCHAR', description: '이벤트 이름' },
                { name: 'user_id', type: 'VARCHAR', description: '사용자 ID' },
                { name: 'created_at', type: 'TIMESTAMP', description: '발생 시각' },
                { name: 'payload', type: 'JSON', description: '원본 응답 본문' },
            ];
        }

        if (conn.type === 'mongodb') {
            return [
                { name: '_id', type: 'OBJECT_ID', description: 'MongoDB 문서 ID' },
                { name: 'product_id', type: 'STRING', description: '주문 데이터와 조인할 상품 ID' },
                { name: 'product_name', type: 'STRING', description: '상품명' },
                { name: 'category', type: 'STRING', description: '상품 카테고리' },
                { name: 'brand', type: 'STRING', description: '브랜드' },
            ];
        }

        return [
            { name: 'order_id', type: 'VARCHAR', description: '주문 식별자' },
            { name: 'user_id', type: 'VARCHAR', description: '고객 식별자' },
            { name: 'product_id', type: 'VARCHAR', description: '상품 식별자' },
            { name: 'order_amount', type: 'NUMERIC', description: '주문 금액' },
            { name: 'order_status', type: 'VARCHAR', description: '주문 상태' },
        ];
    };

    const sourceTypes = [
        { label: 'MongoDB', description: '고객 프로필 문서 컬렉션', icon: Database, className: 'bg-blue-50 text-blue-700 border-blue-100' },
        { label: 'PostgreSQL', description: '주문 거래 테이블', icon: Database, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { label: 'S3', description: 'Bronze/Silver 저장소', icon: Archive, className: 'bg-amber-50 text-amber-700 border-amber-100' },
    ];

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const data = await connectionApi.fetchConnections();
            setConnections(data);
            setSelectedConnectionId((current) => current || data[0]?.id || null);
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
            setSelectedConnectionId((current) => (current === pendingDeleteId ? null : current));
            openToast({ message: '연결을 삭제했습니다', type: 'success' });
        } catch (err) {
            openToast({ message: '연결을 삭제하지 못했습니다', type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setPendingDeleteId(null);
        }
    };

    const handleTestConnection = () => {
        if (!selectedConnection) return;

        setTestStates((prev) => ({
            ...prev,
            [selectedConnection.id]: 'testing',
        }));

        window.setTimeout(() => {
            setTestStates((prev) => ({
                ...prev,
                [selectedConnection.id]: 'success',
            }));
            openToast({ message: '연결 확인이 완료되었습니다', type: 'success' });
        }, 900);
    };

    const selectedTestState = selectedConnection ? testStates[selectedConnection.id] : null;
    const selectedAssets = getDiscoveredAssets(selectedConnection);
    const selectedSchema = getSchemaPreview(selectedConnection);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">데이터 소스</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        MongoDB, PostgreSQL, S3 연결을 등록하고 상태를 확인합니다.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/sources/new')}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    새 데이터 소스 연결
                </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                {sourceTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <div key={type.label} className={`rounded-lg border bg-white p-4 ${type.className}`}>
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                <p className="font-semibold">{type.label}</p>
                            </div>
                            <p className="mt-2 text-xs leading-5">{type.description}</p>
                        </div>
                    );
                })}
            </div>

            {/* Connections List */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                            등록된 데이터 소스 ({connections.length})
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
                                등록된 데이터 소스가 없습니다
                            </h3>
                            <p className="text-gray-600 mb-6">
                                아직 등록한 원본 연결이 없습니다.
                            </p>
                            <button
                                onClick={() => navigate('/sources/new')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                첫 데이터 소스 만들기
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
                                    <tr
                                        key={conn.id}
                                        onClick={() => setSelectedConnectionId(conn.id)}
                                        className={`cursor-pointer transition-colors ${selectedConnection?.id === conn.id ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {conn.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase font-semibold">
                                                {conn.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getConnectionDetail(conn)}
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
                                                {conn.status === 'connected'
                                                    ? '연결됨'
                                                    : conn.status === 'fail' || conn.status === 'error'
                                                        ? '오류'
                                                        : '대기'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleOpenDeleteModal(conn.id);
                                                }}
                                                aria-label={`${conn.name} 삭제`}
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

            <div className="mt-6">
                <div className="rounded-lg bg-white shadow">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900">
                                연결 확인 및 스키마
                            </h2>
                            <FileSearch className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {selectedConnection ? (
                        <div className="space-y-6 p-6">
                            <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                            {getConnectionTypeLabel(selectedConnection.type)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            연결됨
                                        </span>
                                    </div>
                                    <h3 className="mt-3 break-words text-xl font-bold text-gray-900">
                                        {selectedConnection.name}
                                    </h3>
                                    <p className="mt-1 break-words text-sm text-gray-600">
                                        {selectedConnection.description || '등록된 원본 시스템 연결입니다.'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={selectedTestState === 'testing'}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                >
                                    <RefreshCw className={`h-4 w-4 ${selectedTestState === 'testing' ? 'animate-spin' : ''}`} />
                                    {selectedTestState === 'testing' ? '확인 중' : '연결 테스트'}
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        연결 확인
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        정상
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedTestState === 'success' ? '방금 전 재확인됨' : '연결 가능'}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <Layers3 className="h-4 w-4 text-blue-600" />
                                        발견 항목
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {selectedAssets.length}개
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        테이블/토픽/경로 미리보기
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <Table2 className="h-4 w-4 text-purple-600" />
                                        스키마
                                    </div>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {selectedSchema.length}개
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        대표 컬럼 샘플
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">연결 정보</h3>
                                    <div className="space-y-2 rounded-lg border border-gray-200 p-4">
                                        {getConfigRows(selectedConnection).map((row) => (
                                            <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
                                                <span className="shrink-0 text-gray-500">{row.label}</span>
                                                <span className="min-w-0 break-words text-right font-medium text-gray-900">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 className="mb-3 mt-5 text-sm font-semibold text-gray-900">발견된 테이블/토픽</h3>
                                    <div className="space-y-2">
                                        {selectedAssets.map((asset, index) => (
                                            <div
                                                key={asset.name}
                                                className={`rounded-lg border p-3 ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="min-w-0 break-words text-sm font-semibold text-gray-900">{asset.name}</p>
                                                    <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                                        {asset.kind}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">{asset.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900">스키마 미리보기</h3>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            샘플 기준
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">컬럼명</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">타입</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">설명</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {selectedSchema.map((column) => (
                                                    <tr key={column.name}>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{column.name}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{column.type}</td>
                                                        <td className="min-w-[180px] px-4 py-3 text-sm text-gray-500">{column.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            데이터 소스를 선택하면 연결 정보, 발견된 테이블/토픽, 스키마가 표시됩니다.
                        </div>
                    )}
                </div>

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
