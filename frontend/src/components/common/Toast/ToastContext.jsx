import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from './ToastContainer';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();

        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const openToast = useCallback((toastOrMessage, type = 'info', duration = 3000) => {
        if (typeof toastOrMessage === 'object' && toastOrMessage !== null) {
            return showToast(
                toastOrMessage.message || '',
                toastOrMessage.type || type,
                toastOrMessage.duration || duration
            );
        }

        return showToast(toastOrMessage, type, duration);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, openToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
