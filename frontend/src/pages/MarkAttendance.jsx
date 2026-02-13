import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { LoadingSpinner, ErrorState } from '../components/States';
import { useToast } from '../components/Toast';
import { employeeApi, attendanceApi } from '../services/api';

const AVATAR_COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function MarkAttendance() {
    const toast = useToast();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: '' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await employeeApi.getAll();
                setEmployees(res.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.employee_id) errs.employee_id = 'Please select an employee';
        if (!form.date) errs.date = 'Date is required';
        if (!form.status) errs.status = 'Please select a status';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            const result = await attendanceApi.mark(form);
            toast(result.message || 'Attendance marked successfully');
            setForm(prev => ({ ...prev, employee_id: '', status: '' }));
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedEmp = employees.find(e => e.employee_id === form.employee_id);

    if (loading) return <><Header title="Mark Attendance" description="Record daily attendance" /><LoadingSpinner /></>;
    if (error) return <><Header title="Mark Attendance" description="Record daily attendance" /><ErrorState message={error} /></>;

    return (
        <>
            <Header title="Mark Attendance" description="Record daily attendance for employees" />
            <div className="app-content">
                <div className="card" style={{ maxWidth: '680px' }}>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Employee</label>
                                <select
                                    name="employee_id"
                                    className={`form-select ${formErrors.employee_id ? 'error' : ''}`}
                                    value={form.employee_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select an employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.full_name} ({emp.employee_id})
                                        </option>
                                    ))}
                                </select>
                                {formErrors.employee_id && <span className="form-error">{formErrors.employee_id}</span>}
                            </div>

                            {selectedEmp && (
                                <div style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--color-primary-50)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)'
                                }}>
                                    <div className={`employee-avatar ${getAvatarColor(selectedEmp.full_name)}`}>
                                        {getInitials(selectedEmp.full_name)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', fontSize: 'var(--font-size-sm)' }}>{selectedEmp.full_name}</div>
                                        <div style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-xs)' }}>{selectedEmp.department} &middot; {selectedEmp.email}</div>
                                    </div>
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className={`form-input ${formErrors.date ? 'error' : ''}`}
                                        value={form.date}
                                        onChange={handleChange}
                                    />
                                    {formErrors.date && <span className="form-error">{formErrors.date}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                                        <label
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 'var(--space-2)',
                                                padding: 'var(--space-2-5) var(--space-4)',
                                                border: `2px solid ${form.status === 'Present' ? 'var(--color-success)' : 'var(--color-gray-200)'}`,
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                background: form.status === 'Present' ? 'var(--color-success-light)' : 'var(--color-white)',
                                                color: form.status === 'Present' ? 'var(--color-success-dark)' : 'var(--color-gray-500)',
                                                fontWeight: 500,
                                                fontSize: 'var(--font-size-sm)',
                                                transition: 'all 150ms ease'
                                            }}
                                        >
                                            <input type="radio" name="status" value="Present" checked={form.status === 'Present'} onChange={handleChange} style={{ display: 'none' }} />
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            Present
                                        </label>
                                        <label
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 'var(--space-2)',
                                                padding: 'var(--space-2-5) var(--space-4)',
                                                border: `2px solid ${form.status === 'Absent' ? 'var(--color-danger)' : 'var(--color-gray-200)'}`,
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                background: form.status === 'Absent' ? 'var(--color-danger-light)' : 'var(--color-white)',
                                                color: form.status === 'Absent' ? 'var(--color-danger-hover)' : 'var(--color-gray-500)',
                                                fontWeight: 500,
                                                fontSize: 'var(--font-size-sm)',
                                                transition: 'all 150ms ease'
                                            }}
                                        >
                                            <input type="radio" name="status" value="Absent" checked={form.status === 'Absent'} onChange={handleChange} style={{ display: 'none' }} />
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            Absent
                                        </label>
                                    </div>
                                    {formErrors.status && <span className="form-error">{formErrors.status}</span>}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Mark Attendance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
