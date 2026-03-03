'use client';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, CheckSquare, ClipboardList, Settings, User } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const menus = [
        { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    ];

    if (user.role === 'ADMIN') {
        menus.push({ name: 'จัดการการประเมิน', path: '/admin/evaluations', icon: Settings });
    } else if (user.role === 'EVALUATOR') {
        menus.push({ name: 'รายการประเมิน', path: '/evaluator/evaluations', icon: ClipboardList });
    } else if (user.role === 'EVALUATEE') {
        menus.push({ name: 'การประเมินของฉัน', path: '/evaluatee/evaluations', icon: CheckSquare });
    }

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed">
            <div className="p-6 border-b border-slate-200">
                <h1 className="text-xl font-bold text-primary-700">Evaluation System</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                    {menus.map((m) => {
                        const Icon = m.icon;
                        const active = pathname.startsWith(m.path);
                        return (
                            <Link key={m.path} href={m.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={20} />
                                {m.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                    <LogOut size={20} />
                    <span>ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
}
