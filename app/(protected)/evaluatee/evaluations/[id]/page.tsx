'use client';

import { useState, useEffect, use } from 'react';
import { getMyEvaluationDetails, uploadEvidence } from '../../../../../services/evaluatee';
import BackButton from '../../../../../components/BackButton';
import Swal from 'sweetalert2';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export default function EvaluateeEvaluationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const evaluationId = parseInt(resolvedParams.id);
    const [assignment, setAssignment] = useState<any>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [uploadingIndicatorId, setUploadingIndicatorId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const res = await getMyEvaluationDetails(evaluationId);
            if (res.status === 'success') {
                setAssignment(res.data.assignment);
                setEvidenceList(res.data.evidence || []);
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [evaluationId]);

    const handleFileUpload = async (indicatorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file size exceeds 10MB
        const MAX_SIZE_MB = 10;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            Swal.fire('Error', `ขนาดไฟล์ต้องไม่เกิน ${MAX_SIZE_MB}MB`, 'error');
            e.target.value = '';
            return;
        }

        setUploadingIndicatorId(indicatorId);

        const formData = new FormData();
        formData.append('indicatorId', String(indicatorId));
        formData.append('evidence', file);

        try {
            await uploadEvidence(evaluationId, formData);
            Swal.fire('สำเร็จ', 'อัปโหลดหลักฐานเรียบร้อยแล้ว', 'success');
            fetchData();
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
        } finally {
            setUploadingIndicatorId(null);
            // Reset the input so the same file can be selected again if needed
            e.target.value = '';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
    if (!assignment) return <div className="p-8 text-center text-slate-500">ไม่พบข้อมูลการประเมินนี้</div>;

    const evaluation = assignment.evaluation;
    const evaluator = assignment.evaluator;
    const results = assignment.results || [];

    // Calculate progress
    const totalIndicators = evaluation.topics?.flatMap((t: any) => t.indicators || []) || [];
    const totalIndicatorsCount = totalIndicators.length;
    const scoredCount = results.length;
    const isCompleted = scoredCount === totalIndicatorsCount && totalIndicatorsCount > 0;

    // Calculate Total Score %
    let earnedScoreWeight = 0;
    let maxPossibleWeight = 0;
    if (isCompleted) {
        evaluation.topics.forEach((t: any) => {
            t.indicators.forEach((ind: any) => {
                const res = results.find((r: any) => r.indicatorId === ind.id);
                maxPossibleWeight += ind.weight;
                if (res) {
                    let maxScore = ind.type === 'SCALE_1_4' ? 4 : 1;
                    earnedScoreWeight += (res.score / maxScore) * ind.weight;
                }
            });
        });
    }
    const totalPercentage = maxPossibleWeight > 0 ? (earnedScoreWeight / maxPossibleWeight) * 100 : 0;

    // Helper to get uploaded evidence for an indicator
    const getEvidenceForIndicator = (indicatorId: number) => {
        return evidenceList.find(e => e.indicatorId === indicatorId);
    };

    return (
        <div>
            <div className="mb-6"><BackButton label="รายการประเมินของฉัน" /></div>

            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800">{evaluation.name}</h1>
                    <div className="mt-3 text-sm text-slate-600 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">ผู้ประเมิน:</span>
                            <span>{evaluator?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">ระยะเวลา:</span>
                            <span>{new Date(evaluation.startAt).toLocaleDateString('th-TH')} - {new Date(evaluation.endAt).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">ความคืบหน้า:</span>
                            <div className="flex items-center gap-3 flex-1 max-w-xs">
                                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
                                        style={{ width: `${(scoredCount / totalIndicatorsCount) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-slate-500">{scoredCount}/{totalIndicatorsCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isCompleted && (
                    <div className="lg:w-80 bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-xl shadow-lg border border-primary-700 text-white flex flex-col justify-center items-center text-center">
                        <p className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1">คะแนนสรุปของคุณ</p>
                        <h2 className="text-5xl font-black mb-2">{totalPercentage.toFixed(1)}%</h2>
                        <div className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            ประเมินเสร็จสมบูรณ์
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {evaluation.topics?.map((topic: any, index: number) => (
                    <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800">ส่วนที่ {index + 1}: {topic.name}</h2>
                        </div>
                        <div className="p-6">
                            {topic.indicators?.map((indicator: any, indIndex: number) => {
                                const evidence = getEvidenceForIndicator(indicator.id);
                                const isUploading = uploadingIndicatorId === indicator.id;
                                const result = results.find((r: any) => r.indicatorId === indicator.id);

                                return (
                                    <div key={indicator.id} className="mb-6 last:mb-0 pb-6 last:pb-0 border-b border-slate-100 last:border-0">
                                        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">
                                                    {indIndex + 1}. {indicator.name}
                                                    {indicator.requireEvidence && (
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 ${evidence ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {indicator.requireEvidence ? (evidence ? 'แนบหลักฐานแล้ว' : 'ต้องมีหลักฐาน') : ''}
                                                        </span>
                                                    )}
                                                </p>
                                                {indicator.description && <p className="text-sm text-slate-500 mt-1">{indicator.description}</p>}

                                                {isCompleted && result && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">คะแนนที่ได้:</span>
                                                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg font-bold text-sm border border-primary-100">
                                                            {result.score} / {indicator.type === 'SCALE_1_4' ? '4' : '1'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {!isCompleted && indicator.requireEvidence && (
                                                <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
                                                    <label className={`inline-flex items-center gap-2 px-4 py-2 ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-primary-600 hover:bg-primary-50 border-primary-200'} border rounded-xl text-sm font-bold transition-all shadow-sm`}>
                                                        {isUploading ? (
                                                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : <Upload size={16} />}
                                                        {isUploading ? 'กำลังอัปโหลด...' : (evidence ? 'เปลี่ยนหลักฐาน' : 'อัปโหลดหลักฐาน')}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(indicator.id, e)}
                                                            disabled={isUploading}
                                                        />
                                                    </label>
                                                    {evidence && (
                                                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                            <CheckCircle2 size={12} /> อัปโหลดเมื่อ {new Date(evidence.createdAt).toLocaleDateString('th-TH')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {topic.indicators?.length === 0 && (
                                <p className="text-slate-400 text-sm">ไม่มีตัวชี้วัดในหัวข้อนี้</p>
                            )}
                        </div>
                    </div>
                ))}

                {evaluation.topics?.length === 0 && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
                        ยังไม่มีหัวข้อการประเมิน
                    </div>
                )}
            </div>
        </div>
    );
}
