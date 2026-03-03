'use client';

import { useState, useEffect, use } from 'react';
import { getEvaluationsForEvaluator } from '../../../../../services/evaluator';
import BackButton from '../../../../../components/BackButton';
import Link from 'next/link';
import { Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function EvaluatorAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const evaluationId = parseInt(resolvedParams.id);
    const [evaluation, setEvaluation] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getEvaluationsForEvaluator(evaluationId);
                if (res.status === 'success') {
                    setEvaluation(res.data.evaluation);
                    setAssignments(res.data.assignments || []);
                    setEvidenceList(res.data.evidence || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [evaluationId]);

    if (!evaluation) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    // Calculate total indicators and those requiring evidence
    const indicators = evaluation.topics?.flatMap((t: any) => t.indicators || []) || [];
    const totalIndicatorsCount = indicators.length;
    const requiredEvidenceIndicators = indicators.filter((i: any) => i.requireEvidence);

    return (
        <div>
            <div className="mb-6"><BackButton label="รายการการประเมิน" /></div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{evaluation.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        เริ่ม {new Date(evaluation.startAt).toLocaleDateString('th-TH')} - สิ้นสุด {new Date(evaluation.endAt).toLocaleDateString('th-TH')}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold">ตัวชี้วัดทั้งหมด</p>
                        <p className="text-xl font-bold text-slate-800">{totalIndicatorsCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ลำดับ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ชื่อผู้รับการประเมิน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">สถานะหลักฐาน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ความคืบหน้า</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {assignments.map((assignment, index) => {
                            const scoredCount = assignment.results?.length || 0;
                            const progress = totalIndicatorsCount > 0 ? (scoredCount / totalIndicatorsCount) * 100 : 0;
                            const isCompleted = scoredCount === totalIndicatorsCount && totalIndicatorsCount > 0;

                            // Check evidence status for this specific evaluatee
                            const evaluateeEvidence = evidenceList.filter(e => e.evaluateeId === assignment.evaluateeId);
                            const attachedRequiredCount = requiredEvidenceIndicators.filter((ri: any) =>
                                evaluateeEvidence.some((e: any) => e.indicatorId === ri.id)
                            ).length;

                            const evidenceComplete = attachedRequiredCount === requiredEvidenceIndicators.length;

                            return (
                                <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                                                {assignment.evaluatee?.name?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{assignment.evaluatee?.name}</p>
                                                <p className="text-xs text-slate-500">{assignment.evaluatee?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {requiredEvidenceIndicators.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${evidenceComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {evidenceComplete ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    {evidenceComplete ? 'หลักฐานครบถ้วน' : 'กำลังรวบรวมหลักฐาน'}
                                                </div>
                                                <p className="text-[10px] text-slate-400 ml-1">แนบแล้ว {attachedRequiredCount}/{requiredEvidenceIndicators.length} รายการ</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">ไม่ต้องใช้หลักฐาน</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{scoredCount}/{totalIndicatorsCount}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">ประเมินแล้ว {Math.round(progress)}%</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isCompleted ? (
                                            <Link
                                                href={`/evaluator/assignment/${assignment.id}/result`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-xs font-bold transition shadow-sm"
                                            >
                                                <CheckCircle2 size={14} /> ดูผลสรุป
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/evaluator/assignment/${assignment.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 text-xs font-bold transition shadow-sm hover:shadow-md"
                                            >
                                                เริ่มประเมิน
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {assignments.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-slate-300" />
                                    <p>ไม่มีข้อมูลคู่ประเมินที่ได้รับมอบหมาย</p>
                                </div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
