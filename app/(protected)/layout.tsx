'use client';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
                Swal.fire('Unauthorized', 'You do not have permission to access this page.', 'error');
                router.push('/home');
            } else if (pathname.startsWith('/evaluator') && user.role !== 'EVALUATOR') {
                Swal.fire('Unauthorized', 'You do not have permission to access this page.', 'error');
                router.push('/home');
            } else if (pathname.startsWith('/evaluatee') && user.role !== 'EVALUATEE') {
                Swal.fire('Unauthorized', 'You do not have permission to access this page.', 'error');
                router.push('/home');
            }
        }
    }, [user, loading, pathname, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
