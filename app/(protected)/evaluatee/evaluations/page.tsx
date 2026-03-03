'use client';

import { useState, useEffect } from 'react';
import { getMyEvaluations } from '../../../../services/evaluatee';
import BackButton from '../../../../components/BackButton';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function EvaluateeEvaluationsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMyEvaluations();
                if (res.status === 'success') {
                    setAssignments(res.data.assignments || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <div className="mb-6"><BackButton /></div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">การประเมินของฉัน</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ลำดับ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ชื่อการประเมิน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ผู้ประเมิน</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {assignments.map((assignment, index) => (
                            <tr key={assignment.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{assignment.evaluation?.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{assignment.evaluator?.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/evaluatee/evaluations/${assignment.evaluationId}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition whitespace-nowrap text-sm font-medium"
                                    >
                                        <FileText size={16} />
                                        รายละเอียด
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลการประเมิน</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
