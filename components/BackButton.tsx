'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ label = "ย้อนกลับ" }: { label?: string }) {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-700 transition"
        >
            <ArrowLeft size={18} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
}
