'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../services/auth';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EVALUATEE',
        departmentId: 1
    });
    const [loading, setLoading] = useState(false);

    const departments = [
        { id: 1, name: 'HR' },
        { id: 2, name: 'IT' },
        { id: 3, name: 'Sales' },
        { id: 4, name: 'Marketing' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return;

        setLoading(true);
        try {
            const res = await register({
                ...formData,
                departmentId: Number(formData.departmentId)
            });
            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'ลงทะเบียนสำเร็จ',
                    text: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
                    timer: 2000,
                    showConfirmButton: false,
                });
                router.push('/login');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'ลงทะเบียนไม่สำเร็จ',
                text: error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center text-primary-700 mb-8">ลงทะเบียนเข้าใช้งาน</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ - นามสกุล</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">แผนก</label>
                        <select
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">บทบาท (Role)</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="EVALUATEE">ผู้รับการประเมิน (EVALUATEE)</option>
                            <option value="EVALUATOR">ผู้ประเมิน (EVALUATOR)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
                    >
                        {loading ? 'กำลังบันทึก...' : 'ลงทะเบียน'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-500 text-sm">
                    มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                    <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                        เข้าสู่ระบบ
                    </Link>
                </p>
            </div>
        </div>
    );
}
