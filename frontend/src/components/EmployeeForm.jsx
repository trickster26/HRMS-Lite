import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Briefcase, Hash } from 'lucide-react';

const EmployeeForm = ({ initialData, onSuccess, onClose }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id) || Boolean(initialData);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        employee_id: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch existing data if in edit mode
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                department: initialData.department || '',
                employee_id: initialData.employee_id || ''
            });
        } else if (isEditMode && id) {
            const fetchEmployee = async () => {
                try {
                    const response = await getEmployee(id);
                    const { name, email, department, employee_id } = response.data;
                    setFormData({ name, email, department, employee_id });
                } catch (error) {
                    toast.error("Failed to fetch employee details");
                    navigate('/employees');
                }
            };
            fetchEmployee();
        }
    }, [id, isEditMode, navigate, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoading(true);
        try {
            if (isEditMode) {
                const empId = initialData ? initialData.id : id;
                await updateEmployee(empId, formData);
                toast.success('Employee updated successfully');
            } else {
                await createEmployee(formData);
                toast.success('Employee added successfully');
            }
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/employees');
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {!onClose && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </button>
            )}

            <div className={`${onClose ? '' : 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden'}`}>
                {!onClose && (
                    <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{isEditMode ? 'Update the details of the team member.' : 'Enter the details of the new team member.'}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={onClose ? "space-y-6" : "p-8 space-y-6"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Employee ID
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="employee_id"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                    placeholder="EMP001"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Department
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    name="department"
                                    required
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors"
                                    onChange={handleChange}
                                    value={formData.department}
                                >
                                    <option value="" disabled>Select Department</option>
                                    <option value="HR">HR</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Employee' : 'Create Employee')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
