'use client';

import { useState } from 'react';
;
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/services/auth';

export default function LoginPage() {
    const { loginState } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            const res = await login({ email, password });
            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    timer: 1500,
                    showConfirmButton: false,
                });
                loginState(res.token, res.data.user);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                text: error.response?.data?.message || 'Email หรือ Password ไม่ถูกต้อง',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center text-primary-700 mb-8">Personnel Assessment System</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-500 text-sm">
                    ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?{' '}
                    <Link href="/register" className="text-primary-600 hover:text-primary-800 font-medium">
                        ลงทะเบียน
                    </Link>
                </p>
            </div>
        </div>
    );
}
