import { useState } from 'react';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function APISchemaFetcher({
  sourceDatasetId,
  onSchemaFetched,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inferType = (value) => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const handleFetchSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!sourceDatasetId) {
        throw new Error('소스 데이터셋 ID가 없습니다');
      }

      // Fetch preview from API
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
        throw new Error(errorData.detail || '스키마를 가져오지 못했습니다');
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error(
          'API에서 반환된 데이터가 없습니다. 엔드포인트 설정을 확인해주세요.'
        );
      }

      // Infer schema from first row
      const firstRow = result.data[0];
      const inferredColumns = Object.keys(firstRow).map((key) => ({
        name: key,
        type: inferType(firstRow[key]),
        description: '',
      }));

      // Call parent callback
      if (onSchemaFetched) {
        onSchemaFetched(inferredColumns);
      }
    } catch (err) {
      console.error('스키마 가져오기 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-md p-8 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-emerald-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            스키마 정보 없음
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            이 API 소스에는 미리 정의된 스키마가 없습니다. 샘플 데이터를 가져와
            스키마를 자동으로 추론할 수 있습니다.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">스키마 가져오기 실패</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Fetch Button */}
          <button
            onClick={handleFetchSchema}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 justify-center mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                스키마 가져오는 중...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                API에서 스키마 가져오기
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-4">
            API 엔드포인트에 테스트 요청을 보내 데이터 구조를 확인합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
