import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/States';
import { employeeApi, attendanceApi } from '../services/api';

export default function EmployeeDetail() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFilter, setDateFilter] = useState({ start_date: '', end_date: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [empRes, attRes, sumRes] = await Promise.all([
                employeeApi.getOne(employeeId),
                attendanceApi.getByEmployee(employeeId, dateFilter.start_date || dateFilter.end_date ? dateFilter : {}),
                attendanceApi.getSummary(employeeId)
            ]);
            setEmployee(empRes.data);
            setAttendance(attRes.data);
            setSummary(sumRes.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [employeeId]);

    const applyFilter = async () => {
        try {
            const params = {};
            if (dateFilter.start_date) params.start_date = dateFilter.start_date;
            if (dateFilter.end_date) params.end_date = dateFilter.end_date;
            const result = await attendanceApi.getByEmployee(employeeId, params);
            setAttendance(result.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const clearFilter = async () => {
        setDateFilter({ start_date: '', end_date: '' });
        const result = await attendanceApi.getByEmployee(employeeId);
        setAttendance(result.data);
    };

    if (loading) return <><Header title="Employee Detail" /><LoadingSpinner /></>;
    if (error) return <><Header title="Employee Detail" /><ErrorState message={error} onRetry={fetchData} /></>;
    if (!employee) return <><Header title="Employee Detail" /><ErrorState message="Employee not found" /></>;

    return (
        <>
            <Header title={employee.full_name} description={`Employee ID: ${employee.employee_id}`}>
                <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>
            </Header>
            <div className="app-content">
                {/* Employee Info */}
                <div className="card mb-6">
                    <div className="card-header"><h3>Employee Information</h3></div>
                    <div className="card-body">
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Employee ID</label>
                                <span>{employee.employee_id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Full Name</label>
                                <span>{employee.full_name}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email Address</label>
                                <span>{employee.email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Department</label>
                                <span>{employee.department}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Summary */}
                {summary && (
                    <div className="stats-grid mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="stat-card primary">
                            <div className="stat-card-value">{summary.total_records}</div>
                            <div className="stat-card-label">Total Records</div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-card-value">{summary.total_present}</div>
                            <div className="stat-card-label">Days Present</div>
                        </div>
                        <div className="stat-card danger">
                            <div className="stat-card-value">{summary.total_absent}</div>
                            <div className="stat-card-label">Days Absent</div>
                        </div>
                    </div>
                )}

                {/* Attendance Records */}
                <div className="card">
                    <div className="card-header">
                        <h3>Attendance Records</h3>
                    </div>
                    <div className="card-body" style={{ paddingBottom: 0 }}>
                        <div className="flex items-center gap-3 mb-5" style={{ flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>From</label>
                                <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter.start_date} onChange={e => setDateFilter(prev => ({ ...prev, start_date: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>To</label>
                                <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter.end_date} onChange={e => setDateFilter(prev => ({ ...prev, end_date: e.target.value }))} />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={applyFilter}>Apply</button>
                            {(dateFilter.start_date || dateFilter.end_date) && (
                                <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear</button>
                            )}
                        </div>
                    </div>
                    {attendance.length === 0 ? (
                        <EmptyState title="No attendance records" description="No attendance records found for the selected criteria." />
                    ) : (
                        <div className="data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map(rec => {
                                        const d = new Date(rec.date + 'T00:00:00');
                                        return (
                                            <tr key={rec.id}>
                                                <td style={{ fontWeight: 500, color: 'var(--color-gray-800)' }}>{rec.date}</td>
                                                <td>{d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                                                <td>
                                                    <span className={`badge badge-${rec.status.toLowerCase()}`}>
                                                        <span className="badge-dot"></span>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
