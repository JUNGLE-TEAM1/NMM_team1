import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, X, ChevronDown, Check } from 'lucide-react';

export default function SchedulesPanel({ schedules = [], onUpdate }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track which schedule is being edited
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState('');
    const [frequency, setFrequency] = useState('');
    const [description, setDescription] = useState('');

    // UI States for schedule parameters
    const [hourInterval, setHourInterval] = useState(1);
    const [startDate, setStartDate] = useState(''); // YYYY-MM-DDThh:mm

    // Custom Time (Interval) states
    const [intervalDays, setIntervalDays] = useState(0);
    const [intervalHours, setIntervalHours] = useState(0);
    const [intervalMinutes, setIntervalMinutes] = useState(0);

    const frequencyOptions = [
        { value: '', label: '주기 선택' },
        { value: 'hourly', label: '시간별' },
        { value: 'daily', label: '매일' },
        { value: 'weekly', label: '매주' },
        { value: 'monthly', label: '매월' },
        { value: 'interval', label: '사용자 지정 반복' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Helper to generate human-readable summary
    const generateSummary = (s) => {
        const { frequency, uiParams } = s;
        const fallbackSummary = s.cron === 'demo' ? '수동 실행' : (s.cron || '');
        if (!uiParams) return fallbackSummary; // Fallback for legacy

        // If backend hasn't generated cron yet, we can still show summary based on params

        if (frequency === 'hourly') {
            return `${uiParams.hourInterval}시간마다 실행`;
        }

        if (frequency === 'interval') {
            const parts = [];
            if (uiParams.intervalDays > 0) parts.push(`${uiParams.intervalDays}일`);
            if (uiParams.intervalHours > 0) parts.push(`${uiParams.intervalHours}시간`);
            if (uiParams.intervalMinutes > 0) parts.push(`${uiParams.intervalMinutes}분`);
            return `${parts.join(', ') || '0분'}마다 실행, 시작: ${new Date(uiParams.startDate).toLocaleString()}`;
        }

        if (['daily', 'weekly', 'monthly'].includes(frequency) && uiParams.startDate) {
            const date = new Date(uiParams.startDate);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (frequency === 'daily') return `매일 ${timeStr} 실행`;
            if (frequency === 'weekly') return `매주 ${date.toLocaleDateString('ko-KR', { weekday: 'long' })} ${timeStr} 실행`;
            if (frequency === 'monthly') return `매월 ${date.getDate()}일 ${timeStr} 실행`;
        }

        return fallbackSummary;
    };

    // Min datetime for validation (current time)
    const minDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const handleCreateSchedule = () => {
        if (!frequency) return;

        // Validate required fields
        if (frequency === 'interval' && !startDate && (intervalDays === 0 && intervalHours === 0 && intervalMinutes === 0)) return;
        if (['hourly', 'daily', 'weekly', 'monthly', 'interval'].includes(frequency) && !startDate) return;

        // Convert local datetime to UTC ISO string for backend
        let utcStartDate = startDate;
        if (startDate) {
            const localDate = new Date(startDate);
            utcStartDate = localDate.toISOString();
        }

        const scheduleData = {
            id: editingId || Date.now().toString(),
            name: `${frequencyOptions.find((opt) => opt.value === frequency)?.label || frequency} 스케줄`,
            frequency: frequency,
            cron: null, // Backend will generate this
            description: description,
            createdAt: editingId ? (schedules.find(s => s.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
            enabled: true,
            // Store UI parameters to restore them later
            uiParams: {
                hourInterval,
                startDate: utcStartDate,
                intervalDays,
                intervalHours,
                intervalMinutes,
                scheduleDescription: description
            }
        };

        if (editingId) {
            // Update existing
            onUpdate(schedules.map(s => s.id === editingId ? { ...s, ...scheduleData } : s));
        } else {
            // Create new
            onUpdate([...schedules, scheduleData]);
        }

        resetForm();
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setScheduleName(schedule.name);
        setFrequency(schedule.frequency);
        setDescription(schedule.description || '');

        // Restore UI params if available
        if (schedule.uiParams) {
            setHourInterval(schedule.uiParams.hourInterval || 1);

            // Convert UTC ISO string back to local datetime-local format
            if (schedule.uiParams.startDate) {
                const utcDate = new Date(schedule.uiParams.startDate);
                const localDateString = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setStartDate(localDateString);
            } else {
                setStartDate('');
            }

            setIntervalDays(schedule.uiParams.intervalDays || 0);
            setIntervalHours(schedule.uiParams.intervalHours || 0);
            setIntervalMinutes(schedule.uiParams.intervalMinutes || 0);
        } else {
            // Fallback defaults if no uiParams (legacy)
            setHourInterval(1);
            setStartDate('');
            setIntervalDays(0);
            setIntervalHours(0);
            setIntervalMinutes(0);
        }

        setShowCreateForm(true);
    };

    const resetForm = () => {
        setShowCreateForm(false);
        setEditingId(null);
        setScheduleName('');
        setFrequency('');
        setDescription('');
        setHourInterval(1);
        setStartDate('');
        setIntervalDays(0);
        setIntervalHours(0);
        setIntervalMinutes(0);
    };

    const handleDeleteSchedule = (id, e) => {
        e.stopPropagation(); // Prevent triggering edit
        onUpdate(schedules.filter(s => s.id !== id));
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

    // Create Schedule Form - Show automatically if no schedules exist
    if (showCreateForm || schedules.length === 0) {
        return (
            <div className="space-y-6">
                {/* Frequency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        실행 주기
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        >
                            <span className={`block truncate ${!frequency ? 'text-gray-400' : 'text-gray-900'}`}>
                                {frequencyOptions.find(opt => opt.value === frequency)?.label || '주기 선택'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto py-1">
                                {frequencyOptions.filter(opt => opt.value).map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => {
                                            setFrequency(opt.value);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${frequency === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                    >
                                        <span>{opt.label}</span>
                                        {frequency === opt.value && <Check className="w-4 h-4 text-blue-600" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dynamic Fields based on Frequency */}
                {frequency === 'hourly' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            반복 간격 (시간)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                max="23"
                                value={hourInterval}
                                onChange={(e) => setHourInterval(parseInt(e.target.value) || 1)}
                                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-600">시간</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            작업은 {hourInterval}시간마다 정각에 실행됩니다.
                        </p>
                    </div>
                )}

                {['hourly', 'daily', 'weekly', 'monthly', 'interval'].includes(frequency) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            시작 날짜 및 시간
                        </label>
                        <input
                            type="datetime-local"
                            min={minDateTime}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            작업은 이 날짜와 시간부터 실행됩니다.
                            {startDate && startDate < minDateTime && <span className="text-red-500 ml-1">과거 날짜는 선택할 수 없습니다.</span>}
                        </p>
                    </div>
                )}

                {frequency === 'interval' && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            반복 간격
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={intervalDays}
                                        onChange={(e) => setIntervalDays(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-600">일</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={intervalHours}
                                        onChange={(e) => setIntervalHours(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-600">시간</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={intervalMinutes}
                                        onChange={(e) => setIntervalMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-600">분</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            예: 1일 12시간은 작업이 36시간마다 실행된다는 의미입니다.
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleCreateSchedule}
                        disabled={!frequency}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {editingId ? '스케줄 수정' : '스케줄 생성'}
                    </button>
                </div>
            </div>
        );
    }

    // Main Schedules List
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">스케줄</h3>
                </div>
            </div>

            {/* Content */}
            {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">설정된 스케줄이 없습니다</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {schedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            onClick={() => handleEdit(schedule)}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                        >
                            <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {schedule.name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    <span className="capitalize font-medium text-gray-700">{frequencyOptions.find(opt => opt.value === schedule.frequency)?.label || schedule.frequency}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{generateSummary(schedule)}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">
                                    생성일: {formatDate(schedule.createdAt)}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400"
                                    title="스케줄 삭제"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
