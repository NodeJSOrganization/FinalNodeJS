// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component (Component "cha" sẽ bao bọc toàn bộ App)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    // 3. Kiểm tra xem user đã đăng nhập chưa khi tải lại trang
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    // 4. Hàm để gọi khi user đăng nhập thành công
    const login = (userData, tokenData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
        setUser(userData);
        setToken(tokenData);
        // Chuyển hướng đến dashboard sau khi đăng nhập
        if(userData.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/'); // Chuyển về trang chủ cho customer
        }
    };

    // 5. Hàm để đăng xuất
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/login'); // Chuyển về trang đăng nhập
    };

    // 6. "Giá trị" mà chúng ta muốn chia sẻ cho các component con
    const value = {
        user,
        token,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Tạo một custom hook để dễ dàng sử dụng context hơn
export const useAuth = () => {
    return useContext(AuthContext);
};