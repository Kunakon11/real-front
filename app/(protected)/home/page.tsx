'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getAdminEvaluations, getUsersByRole } from '../../../services/admin';
import { getEvaluationsForEvaluator } from '../../../services/evaluator';
import { getMyEvaluations } from '../../../services/evaluatee';
import { Users, ClipboardList, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEvaluations: 0,
        totalEvaluators: 0,
        totalEvaluatees: 0,
        assignedEvaluations: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.role === 'ADMIN') {
                    const [res, evaluatorsRes, evaluateesRes] = await Promise.all([
                        getAdminEvaluations(),
                        getUsersByRole('EVALUATOR'),
                        getUsersByRole('EVALUATEE')
                    ]);
                    if (res.status === 'success') {
                        setStats(prev => ({
                            ...prev,
                            totalEvaluations: res.data.evaluations.length,
                            totalEvaluators: evaluatorsRes?.data?.users?.length || 0,
                            totalEvaluatees: evaluateesRes?.data?.users?.length || 0,
                        }));
                    }
                } else if (user?.role === 'EVALUATOR') {
                    const res = await getEvaluationsForEvaluator();
                    if (res.status === 'success') {
                        setStats(prev => ({
                            ...prev,
                            assignedEvaluations: res.data.evaluations?.length || 0,
                        }));
                    }
                } else if (user?.role === 'EVALUATEE') {
                    const res = await getMyEvaluations();
                    if (res.status === 'success') {
                        setStats(prev => ({
                            ...prev,
                            assignedEvaluations: res.data.assignments?.length || 0,
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        if (user) {
            fetchData();
        }
    }, [user]);

    if (!user) return null;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

            {user.role === 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/admin/evaluations" className="block">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                                <ClipboardList size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">{stats.totalEvaluations}</h2>
                            <p className="text-slate-500 font-medium mt-1">จำนวนการประเมินทั้งหมด</p>
                        </div>
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center opacity-80 cursor-default">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Users size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">{stats.totalEvaluators}</h2>
                        <p className="text-slate-500 font-medium mt-1">จำนวน EVALUATOR</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center opacity-80 cursor-default">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Users size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">{stats.totalEvaluatees}</h2>
                        <p className="text-slate-500 font-medium mt-1">จำนวน EVALUATEE</p>
                    </div>
                </div>
            )}

            {user.role === 'EVALUATOR' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/evaluator/evaluations" className="block">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                <CheckSquare size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">{stats.assignedEvaluations}</h2>
                            <p className="text-slate-500 font-medium mt-1">รายการประเมินที่ได้รับมอบหมาย</p>
                        </div>
                    </Link>
                </div>
            )}

            {user.role === 'EVALUATEE' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/evaluatee/evaluations" className="block">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckSquare size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">{stats.assignedEvaluations}</h2>
                            <p className="text-slate-500 font-medium mt-1">การประเมินที่ต้องรับการประเมิน</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
