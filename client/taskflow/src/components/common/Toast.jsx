import React, { useEffect, useState } from 'react';

const toastStyles = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 20px',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    color: 'white',
    zIndex: 1000,
    fontSize: '16px',
    transition: 'opacity 0.3s ease-in-out',
};

const Toast = ({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 3000
}) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setOpacity(1);
            if (duration > 0) {
                const timer = setTimeout(() => {
                    setOpacity(0);
                    setTimeout(onClose, 300);
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            setOpacity(0);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    let backgroundColor = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    }[type] || '#4CAF50';

    return (
        <div style={{ ...toastStyles, backgroundColor, opacity }}>
            {message}
        </div>
    );
};

export default Toast;
