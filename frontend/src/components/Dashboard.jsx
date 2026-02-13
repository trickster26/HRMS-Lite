import React, { useEffect, useState } from 'react';
import { getEmployees, markAttendance } from '../api';
import { Users, User, UserCheck, UserX, TrendingUp, Clock, AlertCircle, CheckCircle, Briefcase, Calendar, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';

const statsCards = [
    { title: 'Total Employees', value: '0', icon: Users, color: 'indigo', id: 'total' },
    { title: 'Present Today', value: '0', icon: UserCheck, color: 'green', id: 'present' },
    { title: 'Absent Today', value: '0', icon: UserX, color: 'red', id: 'absent' },
    { title: 'Attendance Rate', value: '0%', icon: TrendingUp, color: 'blue', id: 'rate' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, rate: '0%' });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [unmarkedEmployees, setUnmarkedEmployees] = useState([]);
    const [greeting, setGreeting] = useState('');

    const fetchData = async () => {
        try {
            const response = await getEmployees();
            const employees = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) console.error("API Error: Expected array but got", response.data);
            const today = new Date().toISOString().split('T')[0];

            let presentCount = 0;
            let absentCount = 0;
            let allRecent = [];
            let unmarked = [];

            // 1. Calculate Daily Stats & Unmarked
            employees.forEach(emp => {
                const todayRecord = emp.attendance_records?.find(r => r.date === today);
                if (todayRecord) {
                    if (todayRecord.status === 'Present') presentCount++;
                    if (todayRecord.status === 'Absent') absentCount++;
                } else {
                    unmarked.push(emp);
                }

                // Collect recent activity
                emp.attendance_records?.forEach(r => {
                    const recordDate = new Date(r.date);
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                    if (recordDate >= oneWeekAgo) {
                        allRecent.push({
                            ...r,
                            employeeName: emp.name,
                            employeeId: emp.employee_id
                        });
                    }
                });
            });

            // 2. Trend Data (Last 7 Days)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateString = d.toISOString().split('T')[0];

                let dayPresent = 0;
                let dayAbsent = 0;

                employees.forEach(emp => {
                    const record = emp.attendance_records?.find(r => r.date === dateString);
                    if (record?.status === 'Present') dayPresent++;
                    if (record?.status === 'Absent') dayAbsent++;
                });

                last7Days.push({
                    name: d.toLocaleDateString(undefined, { weekday: 'short' }),
                    Present: dayPresent,
                    Absent: dayAbsent
                });
            }
            setTrendData(last7Days);

            // 3. Department Data
            const deptCounts = {};
            employees.forEach(emp => {
                deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
            });
            const deptChartData = Object.keys(deptCounts).map(dept => ({
                name: dept,
                value: deptCounts[dept]
            }));
            setDepartmentData(deptChartData);

            // 4. Finalize States
            allRecent.sort((a, b) => new Date(b.date) - new Date(a.date));
            const total = employees.length;
            const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

            setStats({
                total,
                present: presentCount,
                absent: absentCount,
                rate: `${rate}%`
            });

            setRecentActivity(allRecent.slice(0, 5));
            setUnmarkedEmployees(unmarked.slice(0, 5)); // Show top 5 unmarked
            setLoading(false);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

    }, []);

    const markQuickAttendance = async (id, status) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await markAttendance(id, { date: today, status });
            toast.success(`Marked ${status}`);
            fetchData(); // Refresh all data
        } catch (error) {
            toast.error("Failed to mark attendance");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{greeting}, Admin 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening in your workspace today.
                    </p>
                </div>
                <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card) => {
                    const Icon = card.icon;
                    const value = stats[card.id];
                    let textClass = '', bgClass = '';

                    switch (card.color) {
                        case 'indigo': textClass = 'text-indigo-600 dark:text-indigo-400'; bgClass = 'bg-indigo-50 dark:bg-indigo-900/20'; break;
                        case 'green': textClass = 'text-green-600 dark:text-green-400'; bgClass = 'bg-green-50 dark:bg-green-900/20'; break;
                        case 'red': textClass = 'text-red-600 dark:text-red-400'; bgClass = 'bg-red-50 dark:bg-red-900/20'; break;
                        case 'blue': textClass = 'text-blue-600 dark:text-blue-400'; bgClass = 'bg-blue-50 dark:bg-blue-900/20'; break;
                        default: textClass = 'text-gray-600 dark:text-gray-400'; bgClass = 'bg-gray-50 dark:bg-gray-800';
                    }

                    return (
                        <div key={card.title} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                            <div className={`p-4 rounded-xl mr-4 ${bgClass}`}>
                                <Icon className={`h-6 w-6 ${textClass}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Attendance Trends (Last 7 Days)</h3>
                    <div className="h-72 w-full">
                        {trendData.length > 0 && trendData.some(d => d.Present > 0 || d.Absent > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                title="No attendance trends"
                                description="Trends will appear here once you start marking attendance."
                                icon={TrendingUp}
                            />
                        )}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Department Distribution</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                        {departmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                title="No department data"
                                description="Add employees to see the department distribution."
                                icon={Briefcase}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Action Needed */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Action Needed</h3>
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {unmarkedEmployees.length} Unmarked
                        </span>
                    </div>

                    <div className="flow-root">
                        {unmarkedEmployees.length === 0 ? (
                            <EmptyState
                                title="All caught up!"
                                description="Everyone has marked attendance today. Great job!"
                                icon={CheckCircle}
                                actionLabel={null}
                            />
                        ) : (
                            <ul className="-my-5 divide-y divide-gray-100 dark:divide-slate-700">
                                {unmarkedEmployees.map((emp) => (
                                    <li key={emp.id} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-4 flex-shrink-0">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {emp.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {emp.department}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => markQuickAttendance(emp.id, 'Present')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                                                    title="Mark Present"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => markQuickAttendance(emp.id, 'Absent')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                    title="Mark Absent"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {unmarkedEmployees.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <Link to="/attendance" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center justify-center">
                                    View all unmarked in Attendance <TrendingUp className="ml-1 h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Attendance</h3>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-100 dark:divide-slate-700">
                            {recentActivity.length === 0 ? (
                                <li className="py-2">
                                    <EmptyState
                                        title="No recent activity"
                                        description="Attendance logs will appear here once employees check in."
                                        icon={Clock}
                                    />
                                </li>
                            ) : (
                                recentActivity.map((activity, idx) => (
                                    <li key={idx} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {activity.employeeName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    Marked as <span className={`font-medium ${activity.status === 'Present' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{activity.status}</span>
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                        {recentActivity.length > 0 && (
                            <div className="mt-6">
                                <Link to="/employees" className="w-full flex justify-center items-center px-4 py-2 border border-gray-200 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    View full history
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
