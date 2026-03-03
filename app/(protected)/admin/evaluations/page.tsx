'use client';

import { useState, useEffect } from 'react';
import { getAdminEvaluations, createAdminEvaluation, updateAdminEvaluation, deleteAdminEvaluation } from '../../../../services/admin';
import { Evaluation } from '../../../../types';
import BackButton from '../../../../components/BackButton';
import Link from 'next/link';
import { Edit, Trash, Eye, Plus, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminEvaluationsPage() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startAt: '',
        endAt: '',
        status: 'OPEN'
    });

    const fetchEvaluations = async () => {
        try {
            const res = await getAdminEvaluations();
            if (res.status === 'success') {
                setEvaluations(res.data.evaluations);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const openModal = () => {
        setEditId(null);
        setFormData({ name: '', startAt: '', endAt: '', status: 'OPEN' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
    };

    const handleCreate = async () => {
        try {
            if (!formData.name || !formData.startAt || !formData.endAt) {
                Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
                return;
            }

            const payload = {
                name: formData.name,
                startAt: new Date(formData.startAt).toISOString(),
                endAt: new Date(formData.endAt).toISOString(),
                status: formData.status
            };

            await createAdminEvaluation(payload);
            Swal.fire({ icon: 'success', title: 'เพิ่มสำเร็จ', showConfirmButton: false, timer: 1500 });
            closeModal();
            fetchEvaluations();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'เพิ่มไม่สำเร็จ', 'error');
        }
    };

    const inlineUpdate = async (id: number, data: any) => {
        try {
            await updateAdminEvaluation(id, data);
            Swal.fire({ icon: 'success', title: 'อัปเดตสำเร็จ', showConfirmButton: false, timer: 1500 });
            fetchEvaluations();
            setEditId(null);
        } catch (err: any) {
            Swal.fire('Error', 'อัปเดตไม่สำเร็จ', 'error');
        }
    };

    const confirmDelete = (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบข้อมูลนี้หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteAdminEvaluation(id);
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบแล้ว', 'success');
                    fetchEvaluations();
                } catch (err) {
                    Swal.fire('Error', 'ลบข้อมูลไม่สำเร็จ', 'error');
                }
            }
        });
    };

    return (
        <div>
            <div className="mb-6"><BackButton label="รายการประเมินทั้งหมด" /></div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">จัดการหน้าจอการประเมิน</h1>
                <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                    <Plus size={18} />
                    <span>เพิ่มการประเมิน</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ลำดับ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อแบบประเมิน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">วันที่เริ่ม</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">วันที่สิ้นสุด</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[150px]">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {evaluations.map((item, index) => {
                            const isEditing = editId === item.id;

                            if (isEditing) {
                                return (
                                    <tr key={item.id} className="bg-slate-50">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border rounded px-2 py-1 w-full text-sm outline-primary-500" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="date" value={formData.startAt} onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} className="border rounded px-2 py-1 w-full text-sm outline-primary-500" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="date" value={formData.endAt} onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} className="border rounded px-2 py-1 w-full text-sm outline-primary-500" />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => inlineUpdate(item.id, { name: formData.name, startAt: new Date(formData.startAt).toISOString(), endAt: new Date(formData.endAt).toISOString() })} className="bg-green-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-green-600">บันทึก</button>
                                            <button onClick={() => setEditId(null)} className="bg-slate-300 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-400">ยกเลิก</button>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.startAt).toLocaleDateString('th-TH')}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.endAt).toLocaleDateString('th-TH')}</td>
                                    <td className="px-6 py-4 text-sm space-x-2 text-center whitespace-nowrap">
                                        <Link href={`/admin/evaluations/${item.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                            <Eye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setEditId(item.id);
                                                setFormData({
                                                    name: item.name,
                                                    startAt: item.startAt.split('T')[0],
                                                    endAt: item.endAt.split('T')[0],
                                                    status: 'OPEN'
                                                });
                                            }}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => confirmDelete(item.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition">
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {evaluations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูล</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">เพิ่มการประเมิน</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อแบบประเมิน</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่ม</label>
                                    <input
                                        type="date"
                                        value={formData.startAt}
                                        onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={formData.endAt}
                                        onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition font-medium"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
