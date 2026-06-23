import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../../context/AuthContext";
import { createUser, updateUser, getRoles } from "../../../services/adminApi";

function Toggle({ checked, onChange, label, description }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={clsx(
                "flex items-center justify-between cursor-pointer p-4 rounded-lg border-2 transition-all duration-200",
                checked
                    ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
        >
            <div className="flex-1">
                <span className={clsx(
                    "text-sm font-medium transition-colors",
                    checked ? "text-blue-900" : "text-gray-900"
                )}>
                    {label}
                </span>
                {description && (
                    <p className={clsx(
                        "text-xs mt-0.5 transition-colors",
                        checked ? "text-blue-600" : "text-gray-500"
                    )}>
                        {description}
                    </p>
                )}
            </div>
            <div
                className={clsx(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    checked ? "bg-blue-600" : "bg-gray-300"
                )}
            >
                <span
                    className={clsx(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                        checked ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </div>
        </div>
    );
}

function RoleSelector({ roles, selectedRole, onChange }) {
    return (
        <select
            value={selectedRole || ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="">역할 없음</option>
            {roles.map((role) => (
                <option key={role.id} value={role.id}>
                    {role.name}
                </option>
            ))}
        </select>
    );
}
export default function UserCreateForm({ editingUser, onUserCreated, onCancel }) {
    const { sessionId } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        roleId: null,
        isAdmin: false,
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await getRoles(sessionId);
                setRoles(Array.isArray(rolesData) ? rolesData : []);
            } catch (err) {
                console.error('Failed to fetch roles:', err);
                setRoles([]);
            } finally {
                setRolesLoading(false);
            }
        };
        fetchRoles();
    }, [sessionId]);

    // Load editing user data (map API field names to form field names)
    useEffect(() => {
        if (editingUser) {
            setFormData({
                email: editingUser.email,
                password: "",
                confirmPassword: "",
                name: editingUser.name || "",
                roleId: editingUser.role_id || null,
                isAdmin: editingUser.is_admin || false,
            });
            setErrors({});
            setSuccessMessage("");
        } else {
            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                name: "",
                roleId: null,
                isAdmin: false,
            });
            setErrors({});
            setSuccessMessage("");
        }
    }, [editingUser]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요";
        if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "이메일 형식이 올바르지 않습니다";

        if (!editingUser) {
            if (!formData.password) newErrors.password = "비밀번호를 입력해주세요";
            else if (formData.password.length < 6)
                newErrors.password = "비밀번호는 6자 이상이어야 합니다";

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
            }
        } else if (formData.password) {
            if (formData.password.length < 6)
                newErrors.password = "비밀번호는 6자 이상이어야 합니다";
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const payload = {
                email: formData.email,
                name: formData.name,
                is_admin: formData.isAdmin,
                role_id: formData.roleId,
            };

            // Only include password if provided
            if (formData.password) {
                payload.password = formData.password;
            }

            let data;
            if (editingUser) {
                // Update existing user
                data = await updateUser(sessionId, editingUser.id, payload);
            } else {
                // Create new user (password required)
                payload.password = formData.password;
                data = await createUser(sessionId, payload);
            }

            onUserCreated(data);

            if (!editingUser) {
                setFormData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    name: "",
                    roleId: null,
                    isAdmin: false,
                });
                setSuccessMessage("사용자를 생성했습니다");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Edit Mode Header */}
            {editingUser && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                        수정 중: <strong>{editingUser.name}</strong> ({editingUser.email})
                    </p>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            취소
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* User Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="홍길동"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이메일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                                }
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="user@company.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호 {!editingUser && <span className="text-red-500">*</span>}
                                {editingUser && (
                                    <span className="text-gray-400 text-xs font-normal ml-1">
                                        (유지하려면 비워두세요)
                                    </span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                                }
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                                )}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호 확인{" "}
                                {!editingUser && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    errors.confirmPassword
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                )}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                역할
                            </label>
                            <RoleSelector
                                roles={roles}
                                selectedRole={formData.roleId}
                                onChange={(roleId) =>
                                    setFormData((prev) => ({ ...prev, roleId }))
                                }
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                사용자 권한을 제어할 역할을 지정합니다
                            </p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                관리자 권한
                            </label>
                            <Toggle
                                checked={formData.isAdmin}
                                onChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, isAdmin: checked }))
                                }
                                label="관리자 접근 권한 부여"
                                description="관리자는 모든 기능에 접근하고 다른 사용자를 관리할 수 있습니다"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                    <div>
                        {errors.submit && (
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingUser ? "변경사항 저장" : "사용자 생성"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
