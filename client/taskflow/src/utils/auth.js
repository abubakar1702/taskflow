export const isAuthenticated = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return !!user;
};

export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
};
