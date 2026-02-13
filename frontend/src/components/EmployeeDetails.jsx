import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmployee, markAttendance } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Loader from './Loader';

const EmployeeDetails = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendanceForm, setAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
    });
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [historyFilter, setHistoryFilter] = useState('All');
    const [marking, setMarking] = useState(false);

    const fetchEmployee = async () => {
        try {
            const response = await getEmployee(id);
            setEmployee(response.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch employee details');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setMarking(true);
        try {
            await markAttendance(id, attendanceForm);
            fetchEmployee(); // Refresh data
            toast.success('Attendance marked successfully');
        } catch (err) {
            toast.error('Failed to mark attendance');
        } finally {
            setMarking(false);
        }
    };

    if (loading) return <Loader />;

    if (!employee) return (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Employee not found</h3>
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-4 inline-block">Return to Home</Link>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{employee.employee_id}</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-700">
                    <div className="p-6 flex items-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mr-4">
                            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{employee.department}</p>
                        </div>
                    </div>
                    <div className="p-6 flex items-center">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mr-4">
                            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{employee.email}</p>
                        </div>
                    </div>
                    <div className="p-6 flex items-center">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl mr-4">
                            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Present</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {employee.attendance_records?.filter(r => r.status === 'Present').length || 0} Days
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mark Attendance Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 h-fit">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mark Daily Attendance</h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleMarkAttendance} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    value={attendanceForm.date}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                                    className="block w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAttendanceForm({ ...attendanceForm, status: 'Present' })}
                                        className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${attendanceForm.status === 'Present'
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500 ring-indigo-500'
                                            : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Present
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAttendanceForm({ ...attendanceForm, status: 'Absent' })}
                                        className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${attendanceForm.status === 'Absent'
                                            ? 'border-red-600 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500 ring-red-500'
                                            : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Absent
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={marking}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-2 transition-colors"
                            >
                                {marking ? 'Saving...' : 'Submit Attendance'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Attendance History Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance History</h3>
                        <div className="flex items-center gap-3">
                            <select
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                className="text-sm border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white py-1.5"
                            >
                                <option value="All">All Status</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                            </select>
                            <input
                                type="month"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="text-sm border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white py-1.5"
                            />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-b-2xl">
                        {employee.attendance_records && employee.attendance_records.length > 0 ? (
                            <div className="overflow-y-auto overflow-x-auto max-h-[400px]">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {employee.attendance_records
                                            .filter(record => record.date.startsWith(filterDate))
                                            .filter(record => historyFilter === 'All' || record.status === historyFilter)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Present'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}>
                                                            {record.status === 'Present' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <p className="mt-2 text-gray-500 dark:text-gray-400">No attendance records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
