import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Users, UserPlus, LayoutDashboard, Menu, X, Moon, Sun, Calendar } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100';
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/employees', label: 'All Employees', icon: Users },
        { path: '/attendance', label: 'Attendance', icon: Calendar },
        { path: '/add', label: 'Add New', icon: UserPlus },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col md:flex-row font-sans">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'dark:bg-slate-800 dark:text-white',
                    style: {
                        background: theme === 'dark' ? '#1e293b' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#0f172a',
                    },
                }}
            />

            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-gray-200 dark:border-slate-800 min-h-screen fixed left-0 top-0 bottom-0 z-40 transition-all duration-300">
                <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-slate-800">
                    <div className="p-2 bg-indigo-600 rounded-lg mr-3 shadow-lg shadow-indigo-600/30">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        HRMS Lite
                    </span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(item.path)}`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun className="w-4 h-4 mr-2" /> Light Mode
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4 mr-2" /> Dark Mode
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-600">
                        &copy; {new Date().getFullYear()} HRMS System
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center">
                    <div className="p-1.5 bg-indigo-600 rounded-lg mr-2">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">HRMS</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-16 w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl h-[calc(100vh-4rem)] p-4 transform transition-transform" onClick={e => e.stopPropagation()}>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-4 py-3 text-base font-medium rounded-lg ${isActive(item.path)}`}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-6xl mx-auto animate-fadeIn">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
