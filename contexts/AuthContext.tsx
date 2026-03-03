'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { getMe } from '../services/auth';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginState: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                if (pathname !== '/login' && pathname !== '/register') {
                    router.push('/login');
                }
                return;
            }
            try {
                const res = await getMe();
                if (res.status === 'success') {
                    setUser(res.data.user);
                } else {
                    logout();
                }
            } catch (err) {
                logout();
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [pathname, router]);

    const loginState = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 1 });
        setUser(userData);
        router.push('/home');
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginState, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
