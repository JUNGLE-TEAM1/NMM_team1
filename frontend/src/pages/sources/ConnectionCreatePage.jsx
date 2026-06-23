import { useNavigate } from 'react-router-dom';
import ConnectionForm from '../../components/sources/ConnectionForm';
import { useToast } from '../../components/common/Toast/ToastContext';

export default function ConnectionCreatePage() {
    const { openToast } = useToast();
    const navigate = useNavigate();

    const handleSuccess = () => {
        openToast({ message: '연결을 생성했습니다', type: 'success' });
        navigate('/sources');
    };

    const handleCancel = () => {
        navigate('/sources');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">새 연결 생성</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        원본 데이터 연결 정보를 설정합니다 (RDB, S3, NoSQL 등)
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <ConnectionForm onSuccess={handleSuccess} onCancel={handleCancel} />
                </div>
            </div>
        </div>
    );
}
