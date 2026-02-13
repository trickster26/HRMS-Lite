import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { employeeApi } from '../services/api';

export default function AddEmployee() {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);

    const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Support'];

    const validate = () => {
        const errs = {};
        if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required';
        if (!form.full_name.trim()) errs.full_name = 'Full Name is required';
        if (!form.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Invalid email format';
        }
        if (!form.department.trim()) errs.department = 'Department is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (serverError) setServerError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            setServerError(null);
            await employeeApi.create(form);
            toast('Employee added successfully');
            navigate('/employees');
        } catch (err) {
            setServerError(err.message);
            if (err.details && err.details.length) {
                toast(err.details[0], 'error');
            } else {
                toast(err.message, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header title="Add Employee" description="Create a new employee record" />
            <div className="app-content">
                <div className="card" style={{ maxWidth: '680px' }}>
                    <div className="card-body">
                        {serverError && (
                            <div style={{
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--color-danger-light)',
                                border: '1px solid var(--color-danger-muted)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-danger-hover)',
                                fontSize: 'var(--font-size-sm)',
                                marginBottom: 'var(--space-5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)'
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {serverError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Employee ID</label>
                                    <input
                                        type="text"
                                        name="employee_id"
                                        className={`form-input ${errors.employee_id ? 'error' : ''}`}
                                        placeholder="e.g. EMP001"
                                        value={form.employee_id}
                                        onChange={handleChange}
                                    />
                                    {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        className={`form-input ${errors.full_name ? 'error' : ''}`}
                                        placeholder="e.g. John Doe"
                                        value={form.full_name}
                                        onChange={handleChange}
                                    />
                                    {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-input ${errors.email ? 'error' : ''}`}
                                        placeholder="e.g. john@company.com"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <span className="form-error">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select
                                        name="department"
                                        className={`form-select ${errors.department ? 'error' : ''}`}
                                        value={form.department}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {errors.department && <span className="form-error">{errors.department}</span>}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
