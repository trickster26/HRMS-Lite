import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/States';
import { dashboardApi } from '../services/api';

const AVATAR_COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await dashboardApi.getSummary();
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <><Header title="Dashboard" description="Overview of your HR operations" /><LoadingSpinner text="Loading dashboard..." /></>;
    if (error) return <><Header title="Dashboard" description="Overview of your HR operations" /><ErrorState message={error} onRetry={fetchData} /></>;

    return (
        <>
            <Header title="Dashboard" description="Overview of your HR operations" />
            <div className="app-content">
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-card-top">
                            <div className="stat-card-icon primary">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card-value">{data.total_employees}</div>
                        <div className="stat-card-label">Total Employees</div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-card-top">
                            <div className="stat-card-icon success">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card-value">{data.present_today}</div>
                        <div className="stat-card-label">Present Today</div>
                    </div>

                    <div className="stat-card danger">
                        <div className="stat-card-top">
                            <div className="stat-card-icon danger">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card-value">{data.absent_today}</div>
                        <div className="stat-card-label">Absent Today</div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-card-top">
                            <div className="stat-card-icon warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="stat-card-value">{data.departments.length}</div>
                        <div className="stat-card-label">Departments</div>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h3>Recent Employees</h3>
                            <Link to="/employees" className="btn btn-ghost btn-sm">View All</Link>
                        </div>
                        {data.recent_employees.length === 0 ? (
                            <EmptyState title="No employees yet" description="Add your first employee to get started." action={<Link to="/employees/add" className="btn btn-primary btn-sm">Add Employee</Link>} />
                        ) : (
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Department</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recent_employees.map(emp => (
                                            <tr key={emp.employee_id}>
                                                <td>
                                                    <div className="employee-info">
                                                        <div className={`employee-avatar ${getAvatarColor(emp.full_name)}`}>
                                                            {getInitials(emp.full_name)}
                                                        </div>
                                                        <div>
                                                            <div className="employee-name">{emp.full_name}</div>
                                                            <div className="employee-email">{emp.employee_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-department">{emp.department}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>Recent Attendance</h3>
                            <Link to="/attendance" className="btn btn-ghost btn-sm">Mark Attendance</Link>
                        </div>
                        {data.recent_attendance.length === 0 ? (
                            <EmptyState title="No attendance records" description="Mark attendance to see records here." action={<Link to="/attendance" className="btn btn-primary btn-sm">Mark Attendance</Link>} />
                        ) : (
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recent_attendance.map((rec, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="employee-info">
                                                        <div className={`employee-avatar ${getAvatarColor(rec.full_name)}`}>
                                                            {getInitials(rec.full_name)}
                                                        </div>
                                                        <span className="employee-name">{rec.full_name}</span>
                                                    </div>
                                                </td>
                                                <td>{rec.date}</td>
                                                <td>
                                                    <span className={`badge badge-${rec.status.toLowerCase()}`}>
                                                        <span className="badge-dot"></span>
                                                        {rec.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
