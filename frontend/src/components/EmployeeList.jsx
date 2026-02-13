import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../api';
import { Trash2, Eye, Plus, Search, UserX, ArrowUpDown, Filter, Users, User, UserCheck, TrendingUp, Clock, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import EmployeeForm from './EmployeeForm';
import Loader from './Loader';
import EmptyState from './EmptyState';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, rate: '0%' });

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            const data = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) console.error("API Error: Expected array but got", response.data);
            setEmployees(data);
            setFilteredEmployees(data);

            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch employees');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        let presentCount = 0;
        let absentCount = 0;

        employees.forEach(emp => {
            const todayRecord = emp.attendance_records?.find(r => r.date === today);
            if (todayRecord) {
                if (todayRecord.status === 'Present') presentCount++;
                if (todayRecord.status === 'Absent') absentCount++;
            }
        });

        const total = employees.length;
        const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

        setStats({
            total,
            present: presentCount,
            absent: absentCount,
            rate: `${rate}%`
        });
    }, [employees]);

    useEffect(() => {
        let results = employees.filter(emp =>
            (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (departmentFilter === '' || emp.department === departmentFilter)
        );

        if (sortConfig.key) {
            results.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredEmployees(results);
    }, [searchTerm, departmentFilter, employees, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const confirmDelete = (employee) => {
        setSelectedEmployee(employee);
        setDeleteModalOpen(true);
    };

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;
        try {
            await deleteEmployee(selectedEmployee.id);
            setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
            toast.success('Employee deleted successfully');
            setDeleteModalOpen(false);
        } catch (err) {
            toast.error('Failed to delete employee');
        }
    };

    const uniqueDepartments = [...new Set(employees.map(emp => emp.department))];

    if (loading) return <Loader />;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your workforce</p>
                </div>
                <Link
                    to="/add"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40 ml-auto sm:ml-0"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Employee
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="p-3 rounded-xl mr-4 bg-indigo-50 dark:bg-indigo-900/20">
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="p-3 rounded-xl mr-4 bg-green-50 dark:bg-green-900/20">
                        <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Present Today</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.present}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="p-3 rounded-xl mr-4 bg-red-50 dark:bg-red-900/20">
                        <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Absent Today</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.absent}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="p-3 rounded-xl mr-4 bg-blue-50 dark:bg-blue-900/20">
                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Attendance Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.rate}</p>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, ID..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm appearance-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                        <option value="">All Departments</option>
                        {uniqueDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredEmployees.length === 0 ? (
                <EmptyState
                    title="No employees found"
                    description={searchTerm || departmentFilter ? "Try adjusting your search or filters to find what you're looking for." : "Get started by adding your first employee to the system."}
                    actionLabel={!(searchTerm || departmentFilter) ? "Add Employee" : null}
                    onAction={() => window.location.href = '/add'}
                />
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
                                        onClick={() => requestSort('employee_id')}
                                    >
                                        <div className="flex items-center">
                                            ID
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig.key === 'employee_id' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
                                        onClick={() => requestSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Name
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig.key === 'name' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
                                        onClick={() => requestSort('department')}
                                    >
                                        <div className="flex items-center">
                                            Department
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig.key === 'department' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{emp.employee_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{emp.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                {emp.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={emp.email}>{emp.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link
                                                to={`/employees/${emp.id}`}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button
                                                onClick={() => openEditModal(emp)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                title="Edit Employee"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(emp)}
                                                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                title="Delete Employee"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Employee"
            >
                <div className="text-center sm:text-left">
                    <p className="text-gray-500 dark:text-gray-300">
                        Are you sure you want to delete <strong>{selectedEmployee?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setDeleteModalOpen(false)}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Employee"
            >
                <div className="mt-2 text-left">
                    <EmployeeForm
                        initialData={selectedEmployee}
                        onSuccess={() => {
                            setEditModalOpen(false);
                            fetchEmployees();
                        }}
                        onClose={() => setEditModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeList;
