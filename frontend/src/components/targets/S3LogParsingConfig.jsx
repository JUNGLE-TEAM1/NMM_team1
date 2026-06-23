import { useState, useEffect, useRef } from "react";
import {
  Info,
  FileText,
  Check,
  X,
  AlertCircle,
  PlayCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { s3LogApi } from "../../services/s3LogApi";
import { useToast } from "../common/Toast";

/**
 * S3LogParsingConfig Component
 *
 * Allows users to configure regex patterns for parsing S3 log files.
 * Extracts named groups from Python regex patterns and displays the resulting schema.
 *
 * Props:
 * - initialPattern: Initial regex pattern (optional)
 * - onPatternChange: Callback when pattern changes (pattern, extractedFields)
 * - sourceDatasetId: Source dataset ID for testing regex with actual S3 files
 * - connectionId: Connection ID (used when dataset not saved yet)
 * - bucket: S3 bucket (used when dataset not saved yet)
 * - path: S3 path (used when dataset not saved yet)
 */
export default function S3LogParsingConfig({
  initialPattern = "",
  onPatternChange,
  sourceDatasetId,
  connectionId,
  bucket,
  path,
}) {
  const { showToast } = useToast();
  const [regexPattern, setRegexPattern] = useState(initialPattern);
  const [extractedFields, setExtractedFields] = useState([]);
  const [isValidPattern, setIsValidPattern] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const onPatternChangeRef = useRef(onPatternChange);

  // Test Pattern state
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState("");

  // AI Pattern Generation state
  const [isAILoading, setIsAILoading] = useState(false);

  // Common log format examples
  const EXAMPLE_PATTERNS = [
    {
      name: "Apache Combined Log",
      pattern:
        '^(?P<client_ip>\\S+) \\S+ \\S+ \\[(?P<timestamp>[^\\]]+)\\] "(?P<method>\\S+) (?P<path>\\S+) (?P<protocol>\\S+)" (?P<status_code>\\d+) (?P<bytes_sent>\\S+) "(?P<referrer>[^"]*)" "(?P<user_agent>[^"]*)"',
      description: "표준 Apache combined 로그 형식",
      sample:
        '192.168.1.1 - - [02/Jan/2026:10:56:00 +0900] "GET /api/users HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0"',
    },
    {
      name: "Nginx Access Log",
      pattern:
        '^(?P<client_ip>\\S+) - \\S+ \\[(?P<timestamp>[^\\]]+)\\] "(?P<request>[^"]*)" (?P<status_code>\\d+) (?P<bytes_sent>\\S+)',
      description: "기본 Nginx 접근 로그 형식",
      sample:
        '10.0.0.1 - user [02/Jan/2026:10:56:00 +0900] "POST /api/login" 200 543',
    },
    {
      name: "Custom Application Log",
      pattern:
        "^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?P<level>\\w+)\\] (?P<message>.*)",
      description: "타임스탬프, 레벨, 메시지를 포함한 간단한 애플리케이션 로그",
      sample: "2026-01-02 10:56:00 [INFO] Application started successfully",
    },
  ];

  useEffect(() => {
    onPatternChangeRef.current = onPatternChange;
  }, [onPatternChange]);

  // Extract named groups from Python regex pattern
  useEffect(() => {
    if (!regexPattern.trim()) {
      setExtractedFields([]);
      setIsValidPattern(true);
      setErrorMessage("");
      return;
    }

    try {
      // Extract all named groups from pattern: (?P<field_name>...)
      const namedGroupRegex = /\(\?P<([^>]+)>/g;
      const matches = [...regexPattern.matchAll(namedGroupRegex)];

      if (matches.length === 0) {
        setIsValidPattern(false);
        setErrorMessage(
          "패턴에는 named group이 최소 1개 필요합니다. (?P<field_name>pattern) 문법을 사용하세요."
        );
        setExtractedFields([]);
      } else {
        const fields = matches.map((match) => ({
          name: match[1],
          type: "string", // All regex extracted fields are strings
        }));
        setExtractedFields(fields);
        setIsValidPattern(true);
        setErrorMessage("");

        // Notify parent component
        if (onPatternChangeRef.current) {
          onPatternChangeRef.current(regexPattern, fields);
        }
      }
    } catch (error) {
      setIsValidPattern(false);
      setErrorMessage(`올바르지 않은 Regex 패턴입니다: ${error.message}`);
      setExtractedFields([]);
    }
  }, [regexPattern]);

  const handleUseExample = (pattern) => {
    setRegexPattern(pattern);
    setShowExamples(false);
  };

  const handleTestPattern = async () => {
    if (!regexPattern.trim() || !isValidPattern) {
      setTestError("먼저 올바른 Regex 패턴을 입력해주세요");
      return;
    }

    // For SourceWizard: need connection + bucket + path
    if (!connectionId || !bucket || !path) {
      setTestError("연결, 버킷, 경로가 필요합니다");
      return;
    }

    setIsTestLoading(true);
    setTestError("");
    setTestResult(null);

    try {
      const result = await s3LogApi.testLogParsing({
        connection_id: connectionId,
        bucket: bucket,
        path: path,
        custom_regex: regexPattern,
        limit: 5,
      });

      if (result.valid) {
        setTestResult(result);
        // Update extracted fields with type information from backend
        if (result.columns && result.columns.length > 0) {
          setExtractedFields(result.columns);
          // Notify parent component with updated type information
          if (onPatternChangeRef.current) {
            onPatternChangeRef.current(regexPattern, result.columns);
          }
        }
      } else {
        setTestError(result.error || "테스트에 실패했습니다");
      }
    } catch (error) {
      setTestError(error.message || "Regex 패턴 테스트에 실패했습니다");
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">S3 로그 파싱 설정</p>
          <p className="text-blue-700">
            S3 로그 파일을 파싱할 Regex 패턴을 정의하세요. 필드 추출에는 Python Regex의 named group 문법을 사용합니다:{" "}
            <code className="bg-blue-100 px-1 rounded">
              (?P&lt;field_name&gt;pattern)
            </code>
          </p>
        </div>
      </div>

      {/* Example Patterns Toggle */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Regex 패턴
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!connectionId || !bucket || !path) {
                showToast("AI 생성에는 연결, 버킷, 경로가 필요합니다", "error");
                return;
              }

              setIsAILoading(true);
              try {
                // 백엔드가 S3에서 로그 가져오고 AI 호출까지 한 번에 처리
                const result = await s3LogApi.generateRegex({
                  connection_id: connectionId,
                  bucket: bucket,
                  path: path,
                  limit: 5,
                });

                if (result.success && result.regex_pattern) {
                  setRegexPattern(result.regex_pattern);
                  showToast("Regex 패턴을 생성했습니다", "success");
                } else {
                  showToast(result.error || "Regex 패턴 생성에 실패했습니다", "error");
                }
              } catch (error) {
                console.error("AI Regex 생성 실패:", error);
                showToast("Regex 패턴 생성 실패: " + error.message, "error");
              } finally {
                setIsAILoading(false);
              }
            }}
            disabled={isAILoading || !connectionId || !bucket || !path}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600
                hover:from-indigo-100 hover:to-purple-100 transition-all
                border border-indigo-200/50
                disabled:opacity-50 disabled:cursor-not-allowed"
            title="AI로 Regex 패턴 생성"
          >
            {isAILoading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-600"></div>
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>AI</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showExamples ? "예시 숨기기" : "예시 보기"}
          </button>
        </div>
      </div>

      {/* Example Patterns */}
      {showExamples && (
        <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            예시 패턴:
          </p>
          {EXAMPLE_PATTERNS.map((example, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded border border-gray-200"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {example.name}
                  </p>
                  <p className="text-xs text-gray-600">{example.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseExample(example.pattern)}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">샘플 로그:</p>
                <code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto whitespace-nowrap">
                  {example.sample}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regex Pattern Input */}
      <div>
        <textarea
          value={regexPattern}
          onChange={(e) => setRegexPattern(e.target.value)}
          placeholder="named group을 포함한 Regex 패턴을 입력하세요. 예: ^(?P<client_ip>\S+) .* \[(?P<timestamp>.*?)\] (?P<status>\d+)"
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 ${isValidPattern
            ? "border-gray-300 focus:ring-blue-500"
            : "border-red-500 focus:ring-red-500"
            }`}
        />

        {/* Validation Status */}
        {regexPattern.trim() && (
          <div className="flex items-center gap-2 mt-2">
            {isValidPattern ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  올바른 패턴 - {extractedFields.length}개 필드 감지
                </span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-medium">
                  {errorMessage}
                </span>
              </>
            )}
          </div>
        )}

        {/* Test Pattern Button */}
        {isValidPattern &&
          extractedFields.length > 0 &&
          connectionId &&
          bucket &&
          path && (
            <button
              type="button"
              onClick={handleTestPattern}
              disabled={isTestLoading}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isTestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  패턴 테스트 중...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  실제 S3 로그로 패턴 테스트
                </>
              )}
            </button>
          )}
      </div>

      {/* Test Results */}
      {testError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">
              <p className="font-medium">테스트 실패</p>
              <p className="mt-1">{testError}</p>
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg max-h-96 overflow-y-auto">
          {/* Success Header */}
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Regex 패턴이 정상 동작합니다
              </p>
              <p className="text-xs text-green-700 mt-1">
                총 {testResult.total_lines}개 라인 중 {testResult.parsed_lines}개 라인을 파싱했습니다
              </p>
            </div>
          </div>

          {/* Before: Raw Logs */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-green-100 border-b border-green-200">
              <h5 className="text-xs font-semibold text-green-900">
                전: 원본 로그 라인 (최대 5개)
              </h5>
            </div>
            <div className="p-3 max-h-32 overflow-y-auto">
              {testResult.sample_logs?.map((log, idx) => (
                <div
                  key={idx}
                  className="font-mono text-xs text-gray-700 mb-2 pb-2 border-b border-gray-100 last:border-0"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* After: Parsed Data */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-green-100 border-b border-green-200">
              <h5 className="text-xs font-semibold text-green-900">
                후: 파싱된 데이터 (최대 5개)
              </h5>
            </div>
            <div className="max-h-40 overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    {(testResult.columns || testResult.fields_extracted)?.map((field) => {
                      const fieldName = typeof field === 'string' ? field : field.name;
                      const fieldType = typeof field === 'object' ? field.type : 'string';
                      return (
                        <th
                          key={fieldName}
                          className="px-3 py-2 text-left font-semibold text-gray-700"
                        >
                          {fieldName}
                          {fieldType && (
                            <span className="ml-2 text-xs font-mono px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {fieldType}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {testResult.parsed_rows?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {(testResult.columns || testResult.fields_extracted)?.map((field) => {
                        const fieldName = typeof field === 'string' ? field : field.name;
                        return (
                          <td
                            key={fieldName}
                            className="px-3 py-2 text-gray-800 font-mono"
                          >
                            {row[fieldName] || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Schema Preview */}
      {extractedFields.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              추출된 스키마 ({extractedFields.length}개 필드)
            </h4>
          </div>
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {extractedFields.map((field, idx) => (
              <div
                key={idx}
                className="px-3 py-2 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400 w-4">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {field.name}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-200">
                  {field.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!regexPattern.trim() && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">시작하기</p>
            <p>
              위의 "예시 보기"를 눌러 일반적인 로그 형식 패턴을 확인하거나,
              직접 Regex 패턴을 작성하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
