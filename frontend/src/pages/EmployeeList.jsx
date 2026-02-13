import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/States';
import { useToast } from '../components/Toast';
import { employeeApi } from '../services/api';

const AVATAR_COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await employeeApi.getAll();
            setEmployees(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await employeeApi.delete(deleteTarget.employee_id);
            toast('Employee deleted successfully');
            setDeleteTarget(null);
            fetchEmployees();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Header title="Employees" description={`${employees.length} total employees`}>
                <Link to="/employees/add" className="btn btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Employee
                </Link>
            </Header>
            <div className="app-content">
                {loading ? (
                    <LoadingSpinner text="Loading employees..." />
                ) : error ? (
                    <ErrorState message={error} onRetry={fetchEmployees} />
                ) : employees.length === 0 ? (
                    <div className="card">
                        <EmptyState
                            title="No employees found"
                            description="Get started by adding your first employee to the system."
                            action={<Link to="/employees/add" className="btn btn-primary">Add Employee</Link>}
                        />
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-header">
                            <div className="search-box">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
                                {filtered.length} of {employees.length}
                            </span>
                        </div>
                        {filtered.length === 0 ? (
                            <EmptyState title="No matching results" description="Try adjusting your search terms." />
                        ) : (
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Employee ID</th>
                                            <th>Department</th>
                                            <th>Joined</th>
                                            <th style={{ width: '100px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(emp => (
                                            <tr key={emp.employee_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp.employee_id}`)}>
                                                <td>
                                                    <div className="employee-info">
                                                        <div className={`employee-avatar ${getAvatarColor(emp.full_name)}`}>
                                                            {getInitials(emp.full_name)}
                                                        </div>
                                                        <div>
                                                            <div className="employee-name">{emp.full_name}</div>
                                                            <div className="employee-email">{emp.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><code style={{ fontSize: 'var(--font-size-xs)', background: 'var(--color-gray-100)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-gray-600)' }}>{emp.employee_id}</code></td>
                                                <td><span className="badge badge-department">{emp.department}</span></td>
                                                <td style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-xs)' }}>{new Date(emp.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={e => { e.stopPropagation(); setDeleteTarget(emp); }}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <Modal
                    title="Delete Employee"
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    confirmText="Delete Employee"
                    loading={deleting}
                >
                    <p>Are you sure you want to delete <strong>{deleteTarget.full_name}</strong> ({deleteTarget.employee_id})? This will also remove all their attendance records. This action cannot be undone.</p>
                </Modal>
            )}
        </>
    );
}
