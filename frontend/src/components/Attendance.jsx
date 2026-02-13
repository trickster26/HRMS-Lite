import React, { useState, useEffect } from 'react';
import { getEmployees, markAttendance } from '../api';
import Loader from './Loader';
import { Calendar, CheckCircle, XCircle, Users, User, Check, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, present, absent, unmarked
    const [markingIds, setMarkingIds] = useState(new Set());

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            const data = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) console.error("API Error: Expected array but got", response.data);
            setEmployees(data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load employees");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const getStatusForDate = (employee, date) => {
        const record = employee.attendance_records?.find(r => r.date === date);
        return record ? record.status : null;
    };

    const handleMark = async (employeeId, status) => {
        setMarkingIds(prev => new Set(prev).add(employeeId));
        try {
            await markAttendance(employeeId, { date: selectedDate, status });

            // Optimistic update
            setEmployees(prev => prev.map(emp => {
                if (emp.id === employeeId) {
                    const existingRecordIndex = emp.attendance_records?.findIndex(r => r.date === selectedDate);
                    let newRecords = emp.attendance_records ? [...emp.attendance_records] : [];

                    const newRecord = { date: selectedDate, status, id: Date.now() }; // Temp ID

                    if (existingRecordIndex >= 0) {
                        newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], status };
                    } else {
                        newRecords.push(newRecord);
                    }
                    return { ...emp, attendance_records: newRecords };
                }
                return emp;
            }));
            toast.success(`Marked ${status}`);
        } catch (error) {
            toast.error("Failed to mark attendance");
            fetchEmployees(); // Revert on error
        } finally {
            setMarkingIds(prev => {
                const next = new Set(prev);
                next.delete(employeeId);
                return next;
            });
        }
    };

    const handleMarkAll = async (status) => {
        if (!window.confirm(`Mark ALL displayed employees as ${status}?`)) return;

        // This is a naive implementation firing multiple requests. 
        // Ideal world: Backend bulk endpoint.
        const promises = filteredEmployees.map(emp => {
            const currentStatus = getStatusForDate(emp, selectedDate);
            if (currentStatus !== status) {
                return handleMark(emp.id, status);
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        toast.success("Bulk action completed");
    };

    // Calculate Stats for Selected Date
    const stats = employees.reduce((acc, emp) => {
        const status = getStatusForDate(emp, selectedDate);
        if (status === 'Present') acc.present++;
        else if (status === 'Absent') acc.absent++;
        else acc.unmarked++;
        return acc;
    }, { present: 0, absent: 0, unmarked: 0 });

    // Filter Logic
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const status = getStatusForDate(emp, selectedDate);
        if (filter === 'all') return true;
        if (filter === 'present') return status === 'Present';
        if (filter === 'absent') return status === 'Absent';
        if (filter === 'unmarked') return !status;
        return true;
    });

    if (loading) return <Loader />;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Calendar className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Daily Attendance
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Mark and view attendance for a specific day.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:shadow-md hover:-translate-y-1" onClick={() => setFilter('present')}>
                    <div className="flex items-center min-w-0">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mr-3 flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Present</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white ml-4">{stats.present}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:shadow-md hover:-translate-y-1" onClick={() => setFilter('absent')}>
                    <div className="flex items-center min-w-0">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg mr-3 flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Absent</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white ml-4">{stats.absent}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:shadow-md hover:-translate-y-1" onClick={() => setFilter('unmarked')}>
                    <div className="flex items-center min-w-0">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg mr-3 flex-shrink-0">
                            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">Unmarked</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white ml-4">{stats.unmarked}</span>
                </div>
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    {['all', 'present', 'absent', 'unmarked'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${filter === f
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredEmployees.map((emp) => {
                                const status = getStatusForDate(emp, selectedDate);
                                const isMarking = markingIds.has(emp.id);

                                return (
                                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{emp.employee_id} • {emp.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {status ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Present'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {status === 'Present' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                    {status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    Unmarked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleMark(emp.id, 'Present')}
                                                    disabled={isMarking || status === 'Present'}
                                                    className={`p-1.5 rounded-lg transition-colors ${status === 'Present'
                                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-green-50 text-gray-400 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                                                        }`}
                                                    title="Mark Present"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleMark(emp.id, 'Absent')}
                                                    disabled={isMarking || status === 'Absent'}
                                                    className={`p-1.5 rounded-lg transition-colors ${status === 'Absent'
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-red-50 text-gray-400 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                                                        }`}
                                                    title="Mark Absent"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredEmployees.length === 0 && (
                    <EmptyState
                        title="No records found"
                        description="Try adjusting your filters or date to see more records."
                        actionLabel="Clear Filters"
                        onAction={() => setFilter('all')}
                    />
                )}
            </div>
        </div>
    );
};

export default Attendance;
