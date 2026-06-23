import { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, RefreshCw, Search } from 'lucide-react';

export default function RunsPanel({ runs = [], onRefresh }) {
    const [searchFilter, setSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredRuns = runs.filter(run => {
        const matchesSearch = run.id.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusLabels = {
        succeeded: '성공',
        failed: '실패',
        running: '실행 중',
        pending: '대기 중',
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'running':
                return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            succeeded: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
            running: 'bg-blue-100 text-blue-700',
            pending: 'bg-yellow-100 text-yellow-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Play className="w-5 h-5 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-900">실행 이력</h3>
                            <span className="text-sm text-gray-500">(총 {runs.length}개)</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            새로고침
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 border-b border-gray-200 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="실행 ID로 필터"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">전체 상태</option>
                            <option value="succeeded">성공</option>
                            <option value="failed">실패</option>
                            <option value="running">실행 중</option>
                            <option value="pending">대기 중</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {filteredRuns.length === 0 ? (
                            <div className="text-center py-16">
                                <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">아직 실행 이력이 없습니다</h4>
                                <p className="text-sm text-gray-500">
                                    실행 버튼을 누르면 이 작업이 실행됩니다
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            실행 ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            상태
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            시작 시간
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            종료 시간
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            소요 시간
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            실행 방식
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRuns.map((run) => (
                                        <tr key={run.id} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-blue-600 hover:underline">
                                                    {run.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(run.status)}`}>
                                                    {getStatusIcon(run.status)}
                                                    {statusLabels[run.status] || run.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(run.startTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {run.endTime ? formatDate(run.endTime) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDuration(run.duration)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {run.trigger || '수동 실행'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination placeholder */}
                    {filteredRuns.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                            <span>총 {runs.length}개 중 {filteredRuns.length}개 표시</span>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                    이전
                                </button>
                                <span className="px-3 py-1">1</span>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                                    다음
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
