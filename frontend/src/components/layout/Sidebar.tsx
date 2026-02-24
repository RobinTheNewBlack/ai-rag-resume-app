"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, BotMessageSquare } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            title: "Ask Me",
            href: "/chat",
            icon: <BotMessageSquare className="w-5 h-5" />,
        },
        {
            title: "Candidates",
            href: "/dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            matchPaths: ["/dashboard", "/candidates"],
        },
        {
            title: "Jobs",
            href: "/jobs",
            icon: <Briefcase className="w-5 h-5" />,
        },
    ];

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Sumi.ai</h1>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                    Menu
                </div>
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const paths = item.matchPaths ?? [item.href];
                        const isActive = paths.some(p => pathname === p || pathname.startsWith(p + "/"));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 rounded-md transition-colors duration-200 ${isActive
                                    ? "bg-violet-600 text-white font-bold"
                                    : "text-slate-600 hover:bg-violet-600 hover:text-white"
                                    }`}
                            >
                                <span className={`mr-3 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium">
                        HR
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-700">Recruitment Team</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
