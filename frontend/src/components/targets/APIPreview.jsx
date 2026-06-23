import { useState } from 'react';
import { Eye, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function APIPreview({
  sourceDatasetId,
  onPreviewSuccess,
  onSchemaInferred,
}) {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  const inferType = (value) => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const inferSchema = (data) => {
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
      return Object.keys(firstRow).map((key) => ({
        name: key,
        type: inferType(firstRow[key]),
        description: '',
      }));
    }
    return [
      {
        name: 'value',
        type: inferType(firstRow),
        description: '',
      },
    ];
  };

  const handleFetchPreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      if (!sourceDatasetId) {
        throw new Error('소스 데이터셋 ID가 없습니다');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/source-datasets/${sourceDatasetId}/preview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 10 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '미리보기 데이터를 가져오지 못했습니다');
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error('API에서 반환된 데이터가 없습니다');
      }

      setPreviewData(result.data);

      const inferredColumns = inferSchema(result.data);
      if (onSchemaInferred) {
        onSchemaInferred(inferredColumns);
      }

      // Notify parent that preview succeeded
      if (onPreviewSuccess) {
        onPreviewSuccess();
      }
    } catch (err) {
      console.error('미리보기 가져오기 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">API 미리보기</h3>
            <p className="text-sm text-gray-500 mt-1">
              API 엔드포인트의 샘플 데이터를 확인합니다
            </p>
          </div>
          {!previewData && (
            <button
              onClick={handleFetchPreview}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  불러오는 중...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  미리보기 가져오기
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 min-w-0">
        {/* Initial State */}
        {!previewData && !error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                미리보기 준비 완료
              </h4>
              <p className="text-sm text-gray-500">
                "미리보기 가져오기"를 눌러 API 엔드포인트의 샘플 데이터를 확인하세요.
                최대 10건을 가져옵니다.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md p-6 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    미리보기 가져오기 실패
                  </h4>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={handleFetchPreview}
                    className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State - Data Table */}
        {previewData && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  미리보기를 불러왔습니다
                </h4>
                <p className="text-sm text-green-600 mt-1">
                  API에서 가져온 샘플 {previewData.length}건을 표시합니다.
                  다음 단계로 진행할 수 있습니다.
                </p>
              </div>
              <button
                onClick={handleFetchPreview}
                className="text-sm font-medium text-green-700 hover:text-green-800 underline"
              >
                새로고침
              </button>
            </div>

            {/* Data JSON View */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-auto max-h-96 p-4">
                <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-gray-500">
              <strong>{Object.keys(previewData[0] || {}).length}</strong>개 컬럼 감지
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
