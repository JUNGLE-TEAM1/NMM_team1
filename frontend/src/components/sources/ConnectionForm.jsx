import { useEffect, useState } from "react";
import { connectionApi } from "../../services/connectionApi";
import { s3LogApi } from "../../services/s3LogApi";
import Combobox from "../common/Combobox";

// Connection Type Definitions
const CONNECTION_TYPES = [
  { id: "postgres", label: "PostgreSQL", category: "RDB" },
  { id: "mysql", label: "MySQL", category: "RDB" },
  { id: "mariadb", label: "MariaDB", category: "RDB" },
  { id: "mongodb", label: "MongoDB", category: "NoSQL" },
  { id: "kafka", label: "Kafka", category: "Streaming" },
  { id: "s3", label: "Amazon S3", category: "Storage" },
  { id: "api", label: "REST API", category: "API" },
];

const S3_REGIONS = [
  "us-east-1",
  "us-west-2",
  "ap-northeast-2",
  "ap-northeast-1",
  "eu-west-1",
];

export default function ConnectionForm({ onSuccess, onCancel, initialType }) {
  // Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(initialType || "postgres");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tested, setTested] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  // Initial config templates per type
  const getConfigTemplate = (typeId) => {
    switch (typeId) {
      case "postgres":
      case "mysql":
      case "mariadb":
        return {
          host: "localhost",
          port: typeId === "postgres" ? 5432 : 3306,
          database_name: "",
          user_name: "",
          password: "",
        };
      case "s3":
        return {
          bucket: "",
          region: "ap-northeast-2",
          storageType: "s3",
        };
      case "mongodb":
        return {
          uri: "mongodb://mongo:mongo@mongodb:27017",
          database: "",
        };
      case "api":
        return {
          base_url: "",
          auth_type: "none",
          auth_config: {},
          headers: {},
        };
      case "kafka":
        return {
          bootstrap_servers: "",
        };
      default:
        return {};
    }
  };

  // Configuration Fields (Dynamic)
  const [config, setConfig] = useState(() =>
    getConfigTemplate(initialType || "postgres")
  );

  // Handle Type Change
  const handleTypeChange = (newType) => {
    setType(newType);
    setConfig(getConfigTemplate(newType));
    resetTestStatus();
  };

  // Handle Config Change
  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    resetTestStatus();
  };

  const resetTestStatus = () => {
    setTested(false);
    setTestMessage(null);
    setError(null);
  };

  // Respect initial type when provided (e.g., from Source Wizard)
  useEffect(() => {
    if (!initialType) {
      return;
    }
    setType(initialType);
    setConfig(getConfigTemplate(initialType));
    resetTestStatus();
  }, [initialType]);

  const handleTest = async () => {
    setTestLoading(true);
    setTestMessage(null);
    setError(null);

    try {
      const payload = {
        name: name || "테스트 연결",
        description,
        type,
        config:
          type === "s3"
            ? { ...config, region: config.region || "ap-northeast-2" }
            : config,
      };
      const result = await connectionApi.testConnection(payload);
      setTested(true);
      setTestMessage({ type: "success", text: result.message });
    } catch (err) {
      setTested(false);
      setTestMessage({ type: "error", text: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        type,
        config,
      };
      const newConnection = await connectionApi.createConnection(payload);
      onSuccess(newConnection);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Dynamic Form Fields based on Type
  const renderConfigFields = () => {
    const currentCategory = CONNECTION_TYPES.find(
      (t) => t.id === type
    )?.category;

    if (currentCategory === "RDB") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                호스트
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={config.host || ""}
                onChange={(e) => handleConfigChange("host", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                포트
              </label>
              <input
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={config.port || ""}
                onChange={(e) => handleConfigChange("port", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              데이터베이스 이름
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.database_name || ""}
              onChange={(e) =>
                handleConfigChange("database_name", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              사용자 이름
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.user_name || ""}
              onChange={(e) => handleConfigChange("user_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.password || ""}
              onChange={(e) => handleConfigChange("password", e.target.value)}
            />
          </div>
        </div>
      );
    } else if (type === "s3") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              버킷 이름
            </label>
            <input
              type="text"
              required
              placeholder="e.g., company-logs"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.bucket || ""}
              onChange={(e) => handleConfigChange("bucket", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              S3 버킷 이름입니다. 경로는 데이터셋에서 지정합니다.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              리전
            </label>
            <div className="mt-1">
              <Combobox
                options={S3_REGIONS}
                value={config.region || "ap-northeast-2"}
                onChange={(region) => {
                  if (!region) {
                    return;
                  }
                  handleConfigChange("region", region);
                }}
                getKey={(region) => region}
                getLabel={(region) => region}
                placeholder="리전 선택..."
                classNames={{
                  button:
                    "px-4 py-2.5 rounded-xl border-emerald-200/70 bg-gradient-to-r from-white via-emerald-50/50 to-emerald-100/40 shadow-sm shadow-emerald-100/70 hover:shadow-md hover:shadow-emerald-200/70 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-300 transition-all",
                  panel:
                    "mt-2 rounded-xl border-emerald-100/90 bg-white/95 shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100/70 backdrop-blur",
                  option: "rounded-lg mx-1 my-0.5 hover:bg-emerald-50/70",
                  optionSelected: "bg-emerald-50/80",
                  icon: "text-emerald-500",
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              버킷이 위치한 AWS 리전입니다.
            </p>
          </div>
        </div>
      );
    } else if (type === "kafka") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bootstrap 서버
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 12.34.56.78:9092"
              value={config.bootstrap_servers || ""}
              onChange={(e) =>
                handleConfigChange("bootstrap_servers", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              쉼표로 여러 서버를 입력할 수 있습니다 (예: host1:9092,host2:9092)
            </p>
          </div>
        </div>
      );
    } else if (type === "mongodb") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              연결 URI
            </label>
            <input
              type="text"
              required
              placeholder="mongodb://localhost:27017"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              value={config.uri || ""}
              onChange={(e) => handleConfigChange("uri", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              예: mongodb://user:pass@host:port
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              데이터베이스 이름
            </label>
            <input
              type="text"
              required
              placeholder="my_database"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.database || ""}
              onChange={(e) => handleConfigChange("database", e.target.value)}
            />
          </div>
        </div>
      );
    } else if (type === "api") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Base URL *
            </label>
            <input
              type="text"
              required
              placeholder="https://api.example.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.base_url || ""}
              onChange={(e) => handleConfigChange("base_url", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              API의 기본 URL입니다. 엔드포인트 경로는 데이터셋에서 지정합니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              인증 방식
            </label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={config.auth_type || "none"}
              onChange={(e) => {
                const newAuthType = e.target.value;
                handleConfigChange("auth_type", newAuthType);
                // Reset auth_config when changing auth type
                handleConfigChange("auth_config", {});
              }}
            >
              <option value="none">인증 없음</option>
              <option value="api_key">API Key</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">기본 인증</option>
            </select>
          </div>

          {/* API Key Auth */}
          {config.auth_type === "api_key" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  헤더 이름 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="X-API-Key"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={config.auth_config?.header_name || ""}
                  onChange={(e) =>
                    handleConfigChange("auth_config", {
                      ...config.auth_config,
                      header_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key *
                </label>
                <input
                  type="password"
                  required
                  placeholder="API 키 입력"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={config.auth_config?.api_key || ""}
                  onChange={(e) =>
                    handleConfigChange("auth_config", {
                      ...config.auth_config,
                      api_key: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          {/* Bearer Token Auth */}
          {config.auth_type === "bearer" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bearer Token *
              </label>
              <input
                type="password"
                required
                placeholder="Bearer 토큰 입력"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={config.auth_config?.token || ""}
                onChange={(e) =>
                  handleConfigChange("auth_config", {
                    ...config.auth_config,
                    token: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* Basic Auth */}
          {config.auth_type === "basic" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  사용자 이름 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="사용자 이름"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={config.auth_config?.username || ""}
                  onChange={(e) =>
                    handleConfigChange("auth_config", {
                      ...config.auth_config,
                      username: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호 *
                </label>
                <input
                  type="password"
                  required
                  placeholder="비밀번호"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={config.auth_config?.password || ""}
                  onChange={(e) =>
                    handleConfigChange("auth_config", {
                      ...config.auth_config,
                      password: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-gray-500 text-sm">
          이 연결 유형의 설정 화면은 아직 구현되지 않았습니다.
        </div>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error */}
      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Connection Type Selection */}
      {!initialType && (
        <>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              연결 유형
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONNECTION_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`
                                        flex flex-col items-center justify-center p-3 border rounded-lg transition-all
                                        ${
                                          type === t.id
                                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-700"
                                            : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                        }
                                    `}
                >
                  <span className="font-medium text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4"></div>
        </>
      )}

      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          required
          placeholder="예: 운영 DB"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          설명 (선택)
        </label>
        <textarea
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Dynamic Configuration Fields */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
          {CONNECTION_TYPES.find((t) => t.id === type)?.label} 설정
        </h4>
        {renderConfigFields()}

        {/* Test Connection Section */}
        <div className="mt-6 flex items-center justify-end gap-3">
          {/* Test Result Message Inline */}
          {testMessage && (
            <span
              className={`text-sm font-medium ${
                testMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {testMessage.type === "success" ? "✅ " : "❌ "}
              {testMessage.text}
            </span>
          )}

          <button
            type="button"
            onClick={handleTest}
            disabled={testLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {testLoading ? "테스트 중..." : "연결 테스트"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !tested}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "생성 중..." : "연결 생성"}
        </button>
      </div>
    </form>
  );
}
