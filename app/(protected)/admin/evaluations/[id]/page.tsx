'use client';

import { useState, useEffect, use } from 'react';
import {
    getEvaluationDetails,
    createTopic, updateTopic, deleteTopic,
    createIndicator, updateIndicator, deleteIndicator,
    createAssignment, deleteAssignment, getUsersByRole
} from '../../../../../services/admin';
import BackButton from '../../../../../components/BackButton';
import { Plus, Trash, Edit, RefreshCw, Eye, Download, Users } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminEvaluationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const evaluationId = parseInt(resolvedParams.id);

    const [activeTab, setActiveTab] = useState(1);
    const [evaluation, setEvaluation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newTopicName, setNewTopicName] = useState('');
    const [topicEditingId, setTopicEditingId] = useState<number | null>(null);
    const [editTopicName, setEditTopicName] = useState('');

    const [indicatorForm, setIndicatorForm] = useState({ topicId: 0, name: '', type: 'SCALE_1_4', weight: 0, requireEvidence: false });
    const [indicatorEditingId, setIndicatorEditingId] = useState<number | null>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [assignmentForm, setAssignmentForm] = useState({ evaluatorId: '', evaluateeId: '' });

    const fetchDetails = async () => {
        try {
            const res = await getEvaluationDetails(evaluationId);
            if (res.status === 'success') {
                setEvaluation(res.data.evaluation);
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลการประเมินได้', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getUsersByRole();
            if (res.status === 'success') {
                setUsers(res.data.users);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchUsers();
    }, [evaluationId]);

    // ==== Tab 1: Topics & Indicators ====
    const handleAddTopic = async () => {
        if (!newTopicName.trim()) return;
        try {
            await createTopic(evaluationId, { name: newTopicName });
            setNewTopicName('');
            fetchDetails();
            Swal.fire('สำเร็จ', 'เพิ่มหัวข้อประเมินแล้ว', 'success');
        } catch (e: any) {
            Swal.fire('Error', e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleUpdateTopic = async (id: number) => {
        if (!editTopicName.trim()) return;
        try {
            await updateTopic(id, { name: editTopicName });
            setTopicEditingId(null);
            fetchDetails();
            Swal.fire('สำเร็จ', 'แก้ไขหัวข้อประเมินแล้ว', 'success');
        } catch (e: any) {
            Swal.fire('Error', e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDeleteTopic = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบหัวข้อการประเมินนี้ใช่หรือไม่? ตัวชี้วัดภายใต้หัวข้อนี้จะถูกลบไปด้วย',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });
        if (confirm.isConfirmed) {
            try {
                await deleteTopic(id);
                fetchDetails();
                Swal.fire('สำเร็จ', 'ลบหัวข้อประเมินแล้ว', 'success');
            } catch (e: any) {
                Swal.fire('Error', e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const handleAddIndicator = async () => {
        if (!indicatorForm.topicId || !indicatorForm.name || indicatorForm.weight <= 0) {
            Swal.fire('Error', 'กรุณากรอกข้อมูลตัวชี้วัดให้ครบถ้วน', 'error');
            return;
        }
        try {
            if (indicatorEditingId) {
                await updateIndicator(indicatorEditingId, {
                    name: indicatorForm.name,
                    type: indicatorForm.type,
                    requireEvidence: indicatorForm.requireEvidence,
                    weight: Number(indicatorForm.weight)
                });
                setIndicatorEditingId(null);
                Swal.fire('สำเร็จ', 'แก้ไขตัวชี้วัดแล้ว', 'success');
            } else {
                await createIndicator(indicatorForm.topicId, {
                    name: indicatorForm.name,
                    type: indicatorForm.type,
                    requireEvidence: indicatorForm.requireEvidence,
                    weight: Number(indicatorForm.weight)
                });
                Swal.fire('สำเร็จ', 'เพิ่มตัวชี้วัดแล้ว', 'success');
            }
            setIndicatorForm({ topicId: 0, name: '', type: 'SCALE_1_4', weight: 0, requireEvidence: false });
            fetchDetails();
        } catch (e: any) {
            Swal.fire('Error', e.response?.data?.message || 'น้ำหนักรวมอาจเกิน 100%', 'error');
        }
    };

    const handleDeleteIndicator = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'คุณต้องการลบตัวชี้วัดนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });
        if (confirm.isConfirmed) {
            try {
                await deleteIndicator(id);
                fetchDetails();
                Swal.fire('สำเร็จ', 'ลบตัวชี้วัดแล้ว', 'success');
            } catch (e: any) {
                Swal.fire('Error', e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    // ==== Tab 2: Assignments ====
    const handleAddAssignment = async () => {
        if (!assignmentForm.evaluatorId || !assignmentForm.evaluateeId) {
            Swal.fire('Error', 'กรุณาเลือกผู้ประเมินและผู้รับการประเมิน', 'error');
            return;
        }
        try {
            await createAssignment({
                evaluationId,
                evaluatorId: parseInt(assignmentForm.evaluatorId),
                evaluateeId: parseInt(assignmentForm.evaluateeId)
            });
            setAssignmentForm({ evaluatorId: '', evaluateeId: '' });
            fetchDetails();
            Swal.fire('สำเร็จ', 'เพิ่มคู่ประเมินแล้ว', 'success');
        } catch (e: any) {
            let msg = 'เกิดข้อผิดพลาด';
            if (e.response?.data?.message === 'DUPLICATE_ASSIGNMENT') msg = 'ผู้ประเมินและผู้ถูกประเมินคู่นี้มีอยู่แล้ว';
            if (e.response?.data?.message === 'evaluatorId cannot be same as evaluateeId') msg = 'ไม่สามารถประเมินตัวเองได้';
            Swal.fire('Error', msg, 'error');
        }
    };

    const handleDeleteAssignment = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'ลบคู่ประเมินนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });
        if (confirm.isConfirmed) {
            try {
                await deleteAssignment(id);
                fetchDetails();
                Swal.fire('สำเร็จ', 'ลบคู่ประเมินแล้ว', 'success');
            } catch (e: any) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary-600" /></div>;

    const evaluators = users.filter(u => u.role === 'EVALUATOR');
    const evaluatees = users.filter(u => u.role === 'EVALUATEE');

    let totalWeight = 0;
    evaluation?.topics.forEach((t: any) => {
        t.indicators.forEach((i: any) => {
            totalWeight += i.weight;
        });
    });

    return (
        <div>
            <div className="mb-6"><BackButton label="กลับสู่หน้ารายการประเมิน" /></div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{evaluation?.name}</h1>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                        <p>เริ่ม: {evaluation?.startAt ? new Date(evaluation.startAt).toLocaleDateString('th-TH') : '-'}</p>
                        <p>สิ้นสุด: {evaluation?.endAt ? new Date(evaluation.endAt).toLocaleDateString('th-TH') : '-'}</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-amber-500'}`}>น้ำหนักรวม: {totalWeight}%</p>
                    {totalWeight !== 100 && <p className="text-xs text-amber-500">แนะนำให้น้ำหนักรวมตัวชี้วัดเท่ากับ 100%</p>}
                </div>
            </div>

            <div className="border-b border-slate-200 mb-6 flex gap-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab(1)}
                    className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 1 ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    ข้อมูลหัวข้อประเมิน (Topics / Indicators)
                </button>
                <button
                    onClick={() => setActiveTab(2)}
                    className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 2 ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    จัดการคู่ประเมิน (Assignments)
                </button>
                <button
                    onClick={() => setActiveTab(3)}
                    className={`py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 3 ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    สรุปผลและรายงาน (Results)
                </button>
            </div>

            <div className="min-h-[400px]">
                {/* TAB 1: TOPICS & INDICATORS */}
                {activeTab === 1 && (
                    <div className="space-y-6">
                        {/* Topics List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">หัวข้อประเมิน (Topics)</h2>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="ชื่อหัวข้อประเมินใหม่"
                                    className="border border-slate-300 rounded-lg px-4 py-2 flex-grow focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newTopicName}
                                    onChange={e => setNewTopicName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                                />
                                <button onClick={handleAddTopic} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5" /> เพิ่มหัวข้อ
                                </button>
                            </div>

                            <div className="space-y-4">
                                {evaluation?.topics.map((topic: any) => (
                                    <div key={topic.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                                            {topicEditingId === topic.id ? (
                                                <div className="flex gap-2 items-center w-full">
                                                    <input
                                                        className="border px-2 py-1 rounded w-full"
                                                        value={editTopicName}
                                                        onChange={e => setEditTopicName(e.target.value)}
                                                    />
                                                    <button onClick={() => handleUpdateTopic(topic.id)} className="text-primary-600 text-sm font-bold">บันทึก</button>
                                                    <button onClick={() => setTopicEditingId(null)} className="text-slate-500 text-sm">ยกเลิก</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 max-w-[80%]">{topic.name}</span>
                                                    <button onClick={() => { setTopicEditingId(topic.id); setEditTopicName(topic.name); }} className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                            {topicEditingId !== topic.id && (
                                                <button onClick={() => handleDeleteTopic(topic.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md transition-colors">ลบหัวข้อ</button>
                                            )}
                                        </div>
                                        <div className="p-4 bg-white">
                                            {topic.indicators.length > 0 ? (
                                                <table className="w-full text-left text-sm mb-4">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 text-slate-500">
                                                            <th className="pb-2 font-medium">ชื่อตัวชี้วัด</th>
                                                            <th className="pb-2 font-medium hidden sm:table-cell">ประเภทอ้างอิง</th>
                                                            <th className="pb-2 font-medium text-center w-20">น้ำหนัก</th>
                                                            <th className="pb-2 font-medium text-right w-24">จัดการ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {topic.indicators.map((ind: any) => (
                                                            <tr key={ind.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                                <td className="py-2">{ind.name}</td>
                                                                <td className="py-2 hidden sm:table-cell text-slate-500 truncate max-w-xs "><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{ind.type === 'SCALE_1_4' ? 'ประเมิน 1-4' : 'ใช่/ไม่ใช่'}</span> {ind.requireEvidence ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">ต้องแนบหลักฐาน</span> : null}</td>
                                                                <td className="py-2 text-center">{ind.weight}%</td>
                                                                <td className="py-2 text-right">
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button
                                                                            onClick={() => {
                                                                                setIndicatorEditingId(ind.id);
                                                                                setIndicatorForm({ topicId: topic.id, name: ind.name, type: ind.type, requireEvidence: ind.requireEvidence, weight: ind.weight });
                                                                            }}
                                                                            className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteIndicator(ind.id)}
                                                                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                                                        >
                                                                            <Trash className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-sm text-slate-400 mb-4 items-center">ยังไม่มีตัวชี้วัดภายใต้หัวข้อนี้</p>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setIndicatorEditingId(null);
                                                    setIndicatorForm({ topicId: topic.id, name: '', type: 'SCALE_1_4', weight: 0, requireEvidence: false });
                                                }}
                                                className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-800"
                                            >
                                                <Plus className="w-4 h-4" /> เพิ่มตัวชี้วัดใหม่ในช่องทางด้านล่างนี้
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {evaluation?.topics.length === 0 && (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                                        ยังไม่มีหัวข้อการประเมิน
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit/Add Indicator Form (appears below topics) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                {indicatorEditingId ? "แก้ไขตัวชี้วัด" : "ฟอร์มเพิ่มตัวชี้วัด"}
                                {indicatorEditingId && <button onClick={() => { setIndicatorEditingId(null); setIndicatorForm({ topicId: 0, name: '', type: 'SCALE_1_4', weight: 0, requireEvidence: false }); }} className="text-sm font-normal text-slate-400 hover:text-slate-600 ml-auto border px-2 py-1 rounded">ยกเลิก</button>}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="lg:col-span-1">
                                    <label className="block text-sm text-slate-500 mb-1">หัวข้อประเมิน</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-slate-100"
                                        value={indicatorForm.topicId}
                                        onChange={e => setIndicatorForm({ ...indicatorForm, topicId: parseInt(e.target.value) })}
                                        disabled={!!indicatorEditingId}
                                    >
                                        <option value={0}>เลือกหัวข้อ...</option>
                                        {evaluation?.topics.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm text-slate-500 mb-1">ชื่อตัวชี้วัด</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                        value={indicatorForm.name}
                                        onChange={e => setIndicatorForm({ ...indicatorForm, name: e.target.value })}
                                        placeholder="ความรับผิดชอบ"
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm text-slate-500 mb-1">รูปแบบประเมิน</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                        value={indicatorForm.type}
                                        onChange={e => setIndicatorForm({ ...indicatorForm, type: e.target.value })}
                                    >
                                        <option value="SCALE_1_4">ประเมินระดับ 1-4</option>
                                        <option value="YES_NO">ใช่ / ไม่ใช่</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm text-slate-500 mb-1">ต้องการหลักฐาน?</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                        value={indicatorForm.requireEvidence ? "true" : "false"}
                                        onChange={e => setIndicatorForm({ ...indicatorForm, requireEvidence: e.target.value === "true" })}
                                    >
                                        <option value="false">ไม่จำเป็น</option>
                                        <option value="true">ต้องแนบหลักฐาน</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm text-slate-500 mb-1">น้ำหนัก (%)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50"
                                            value={indicatorForm.weight || ''}
                                            onChange={e => setIndicatorForm({ ...indicatorForm, weight: parseInt(e.target.value) || 0 })}
                                        />
                                        <button
                                            onClick={handleAddIndicator}
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex-shrink-0 transition-colors"
                                        >
                                            {indicatorEditingId ? "บันทึก" : "เพิ่ม"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ASSIGNMENTS */}
                {activeTab === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">เพิ่มคู่ประเมิน</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">ผู้ประเมิน (Evaluator)</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                        value={assignmentForm.evaluatorId}
                                        onChange={e => setAssignmentForm({ ...assignmentForm, evaluatorId: e.target.value })}
                                    >
                                        <option value="">เลือกผู้ประเมิน...</option>
                                        {evaluators.map(u => <option key={`ev-${u.id}`} value={u.id}>{u.name} ({u.email})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">ผู้ถูกประเมิน (Evaluatee)</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                                        value={assignmentForm.evaluateeId}
                                        onChange={e => setAssignmentForm({ ...assignmentForm, evaluateeId: e.target.value })}
                                    >
                                        <option value="">เลือกผู้ถูกประเมิน...</option>
                                        {evaluatees.map(u => <option key={`ee-${u.id}`} value={u.id}>{u.name} ({u.email})</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleAddAssignment}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                            >
                                เพิ่มการจับคู่
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">รายการคู่ประเมิน</h2>
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="pb-3 px-4 font-medium">ผู้ประเมิน</th>
                                        <th className="pb-3 px-4 font-medium">ผู้ถูกประเมิน</th>
                                        <th className="pb-3 px-4 font-medium">สถานะ</th>
                                        <th className="pb-3 px-4 font-medium w-24">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluation?.assignments?.map((a: any) => (
                                        <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{a.evaluator?.name?.substring(0, 2).toUpperCase()}</div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{a.evaluator?.name}</p>
                                                        <p className="text-xs text-slate-500">{a.evaluator?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{a.evaluatee?.name?.substring(0, 2).toUpperCase()}</div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{a.evaluatee?.name}</p>
                                                        <p className="text-xs text-slate-500">{a.evaluatee?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.results && a.results.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {a.results && a.results.length > 0 ? 'ประเมินแล้ว' : 'ยังไม่ประเมิน'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => handleDeleteAssignment(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบคู่ประเมิน">
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!evaluation?.assignments || evaluation.assignments.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-500">ไม่มีข้อมูลคู่ประเมิน</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: RESULTS */}
                {activeTab === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">ภาพรวมผลการประเมิน</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                                        <th className="py-3 px-4 font-semibold">ผู้ถูกประเมิน</th>
                                        <th className="py-3 px-4 font-semibold">ผู้ประเมิน</th>
                                        <th className="py-3 px-4 font-semibold text-center">ความคืบหน้า</th>
                                        <th className="py-3 px-4 font-semibold text-center">คะแนนรวม</th>
                                        <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluation?.assignments?.map((a: any) => {
                                        const assignmentsResults = a.results || [];
                                        const totalIndicators = evaluation.topics.reduce((acc: number, t: any) => acc + t.indicators.length, 0);
                                        const scoredCount = assignmentsResults.length;

                                        // Calculate Score % based on Weight
                                        let earnedScoreWeight = 0;
                                        let maxPossibleWeight = 0;

                                        evaluation.topics.forEach((t: any) => {
                                            t.indicators.forEach((ind: any) => {
                                                const res = assignmentsResults.find((r: any) => r.indicatorId === ind.id);
                                                maxPossibleWeight += ind.weight;

                                                if (res) {
                                                    let maxScore = ind.type === 'SCALE_1_4' ? 4 : 1;
                                                    earnedScoreWeight += (res.score / maxScore) * ind.weight;
                                                }
                                            });
                                        });

                                        const totalPercentage = maxPossibleWeight > 0 ? (earnedScoreWeight / maxPossibleWeight) * 100 : 0;
                                        const isDone = scoredCount === totalIndicators && totalIndicators > 0;

                                        return (
                                            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-800">{a.evaluatee?.name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">{a.evaluatee?.email}</div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">{a.evaluator?.name}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs">{scoredCount} / {totalIndicators}</span>
                                                        <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                                            <div
                                                                className={`h-full ${isDone ? 'bg-green-500' : 'bg-primary-500'}`}
                                                                style={{ width: `${(scoredCount / totalIndicators) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`font-bold text-lg ${totalPercentage >= 80 ? 'text-green-600' : totalPercentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                        {totalPercentage.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {isDone ? 'สำเร็จ' : 'กำลังดำเนินการ'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!evaluation?.assignments || evaluation.assignments.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">
                                                ไม่มีข้อมูลการประเมินในระบบ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
