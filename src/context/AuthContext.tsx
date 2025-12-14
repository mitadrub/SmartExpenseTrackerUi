import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // Decode token or fetch user details if endpoint exists
            // For now, we just persist it
            sessionStorage.setItem('token', token);
            // Ideally parse JWT for username or fetch from API
            // setUser({ username: 'User' }); 
        } else {
            sessionStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string, username: string) => {
        setToken(newToken);
        setUser({ username });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
