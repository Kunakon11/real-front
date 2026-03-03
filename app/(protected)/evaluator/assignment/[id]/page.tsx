'use client';

import { useState, useEffect, use } from 'react';
import { getAssignmentForEvaluator, giveScore } from '../../../../../services/evaluator';
import BackButton from '../../../../../components/BackButton';
import Swal from 'sweetalert2';
import { Save, CheckCircle2, ExternalLink, FileWarning } from 'lucide-react';

export default function EvaluatorAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const assignmentId = parseInt(resolvedParams.id);
    const [assignment, setAssignment] = useState<any>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<number, number>>({});
    const [saving, setSaving] = useState(false);

    const FILE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await getAssignmentForEvaluator(assignmentId);
                if (res.status === 'success') {
                    setAssignment(res.data.assignment);
                    setEvidenceList(res.data.evidence || []);

                    // pre-load existing scores
                    const initialScores: Record<number, number> = {};
                    res.data.assignment.results?.forEach((r: any) => {
                        initialScores[r.indicatorId] = r.score;
                    });
                    setScores(initialScores);
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลแบบประเมินได้', 'error');
            }
        };
        fetchAssignment();
    }, [assignmentId]);

    const getEvidenceForIndicator = (indicatorId: number) => {
        return evidenceList.find(e => e.indicatorId === indicatorId);
    };

    const getFileUrl = (path: string) => {
        if (!path) return '#';
        // Handle windows backslashes
        const normalizedPath = path.replace(/\\/g, '/');
        return `${FILE_BASE_URL}/${normalizedPath}`;
    };

    if (!assignment) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    const evaluation = assignment.evaluation;
    const evaluatee = assignment.evaluatee;

    const handleScoreChange = (indicatorId: number, score: number) => {
        setScores(prev => ({ ...prev, [indicatorId]: score }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        let hasError = false;

        try {
            // Validate that indicators requiring evidence have evidence
            for (const topic of evaluation.topics) {
                for (const indicator of topic.indicators) {
                    if (indicator.requireEvidence && !getEvidenceForIndicator(indicator.id)) {
                        // If there's a score but no evidence, that's technically blocked by backend but we check here too
                        if (scores[indicator.id] !== undefined) {
                            Swal.fire('Error', `ตัวชี้วัด "${indicator.name}" ต้องมีหลักฐานประกอบก่อนส่งผล`, 'error');
                            setSaving(false);
                            return;
                        }
                    }
                }
            }

            for (const indicatorIdStr of Object.keys(scores)) {
                const indicatorId = parseInt(indicatorIdStr);
                const score = scores[indicatorId];
                await giveScore(assignmentId, { indicatorId, score });
            }

            Swal.fire('สำเร็จ', 'บันทึกผลการประเมินเรียบร้อยแล้ว', 'success');
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
            hasError = true;
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6"><BackButton label="รายการประเมินที่ได้รับมอบหมาย" /></div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">ประเมิน: {evaluatee?.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">แบบประเมิน: {evaluation?.name}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">ID การจับคู่: #{assignmentId}</span>
                </div>
            </div>

            <div className="space-y-6">
                {evaluation?.topics?.map((topic: any, index: number) => (
                    <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800">ส่วนที่ {index + 1}: {topic.name}</h2>
                        </div>
                        <div className="p-6">
                            {topic.indicators?.map((indicator: any, indIndex: number) => {
                                const currentScore = scores[indicator.id];
                                const evidence = getEvidenceForIndicator(indicator.id);
                                const isBlocked = indicator.requireEvidence && !evidence;

                                return (
                                    <div key={indicator.id} className="mb-6 last:mb-0 pb-6 last:pb-0 border-b border-slate-100 last:border-0">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">
                                                    {indIndex + 1}. {indicator.name}
                                                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded ml-2">น้ำหนัก {indicator.weight}%</span>
                                                    {indicator.requireEvidence && (
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 ${evidence ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {evidence ? 'มีหลักฐานแล้ว' : 'ต้องมีหลักฐาน'}
                                                        </span>
                                                    )}
                                                </p>
                                                {indicator.description && <p className="text-sm text-slate-500 mt-1">{indicator.description}</p>}

                                                {evidence && (
                                                    <a
                                                        href={getFileUrl(evidence.filePath)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                                                    >
                                                        <ExternalLink size={14} /> ดูหลักฐานประกอบ
                                                    </a>
                                                )}

                                                {isBlocked && (
                                                    <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                        <FileWarning size={16} />
                                                        <span>ยังไม่สามารถให้คะแนนได้ เนื่องจากผู้รับการประเมินยังไม่ได้แนบหลักฐาน</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`mt-4 ${isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {indicator.type === 'SCALE_1_4' && (
                                                <div className="flex flex-wrap gap-4">
                                                    {[1, 2, 3, 4].map(scoreVal => (
                                                        <label key={scoreVal} className={`flex items-center justify-center min-w-[100px] p-3 border rounded-lg cursor-pointer transition-all ${currentScore === scoreVal ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                                                            <input
                                                                type="radio"
                                                                name={`ind-${indicator.id}`}
                                                                value={scoreVal}
                                                                checked={currentScore === scoreVal}
                                                                onChange={() => handleScoreChange(indicator.id, scoreVal)}
                                                                className="hidden"
                                                                disabled={isBlocked}
                                                            />
                                                            ระดับ {scoreVal}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {indicator.type === 'YES_NO' && (
                                                <div className="flex flex-wrap gap-4">
                                                    <label className={`flex items-center justify-center px-6 py-3 border rounded-lg cursor-pointer transition-all ${currentScore === 1 ? 'border-green-500 bg-green-50 text-green-700 font-bold shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                        <input
                                                            type="radio"
                                                            name={`ind-${indicator.id}`}
                                                            value={1}
                                                            checked={currentScore === 1}
                                                            onChange={() => handleScoreChange(indicator.id, 1)}
                                                            className="hidden"
                                                            disabled={isBlocked}
                                                        />
                                                        ใช่ / ผ่าน
                                                    </label>
                                                    <label className={`flex items-center justify-center px-6 py-3 border rounded-lg cursor-pointer transition-all ${currentScore === 0 ? 'border-red-500 bg-red-50 text-red-700 font-bold shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                        <input
                                                            type="radio"
                                                            name={`ind-${indicator.id}`}
                                                            value={0}
                                                            checked={currentScore === 0}
                                                            onChange={() => handleScoreChange(indicator.id, 0)}
                                                            className="hidden"
                                                            disabled={isBlocked}
                                                        />
                                                        ไม่ใช่ / ไม่ผ่าน
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                    {saving ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกผลการประเมิน</>}
                </button>
            </div>
        </div>
    );
}

