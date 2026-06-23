import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Trash2, Loader2 } from "lucide-react";
import { useAICopilot } from "../../context/AICopilotContext";
import ChatMessage from "./ChatMessage";

export default function AICopilotPanel() {
  const {
    isOpen,
    closePanel,
    messages,
    isLoading,
    sendMessage,
    clearChat,
  } = useAICopilot();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] lg:hidden"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[1001]
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                AI 도우미
              </h2>
              <p className="text-xs text-gray-500">자연어 SQL 변환</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/60 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                title="대화 지우기"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={closePanel}
              className="p-2 hover:bg-white/60 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="데이터에 대해 질문하세요..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-400
                placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300
                text-white rounded-xl transition-colors flex items-center justify-center
                disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-indigo-500" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">
        AI SQL 도우미
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
        자연어로 데이터에 대해 질문하면 SQL 쿼리를 생성합니다.
      </p>
      <div className="space-y-2 w-full max-w-[280px]">
        <ExamplePrompt text="매출 기준 상위 고객 10명을 보여줘" />
        <ExamplePrompt text="지난달 주문 수는 몇 건이야?" />
        <ExamplePrompt text="gmail.com 이메일 도메인을 가진 사용자를 보여줘" />
      </div>
    </div>
  );
}

function ExamplePrompt({ text }) {
  const { sendMessage } = useAICopilot();

  return (
    <button
      onClick={() => sendMessage(text)}
      className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
    >
      "{text}"
    </button>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <Loader2 size={16} className="text-emerald-600 animate-spin" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>SQL 생성 중</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
