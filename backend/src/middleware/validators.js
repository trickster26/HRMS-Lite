/**
 * Request validation middleware for HRMS Lite.
 * Validates required fields, email format, and data integrity.
 */

function validateEmployee(req, res, next) {
    const { employee_id, full_name, email, department } = req.body;
    const errors = [];

    if (!employee_id || typeof employee_id !== 'string' || !employee_id.trim()) {
        errors.push('Employee ID is required');
    }

    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
        errors.push('Full Name is required');
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
        errors.push('Email Address is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Invalid email format');
        }
    }

    if (!department || typeof department !== 'string' || !department.trim()) {
        errors.push('Department is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Sanitize inputs
    req.body.employee_id = employee_id.trim();
    req.body.full_name = full_name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.department = department.trim();

    next();
}

function validateAttendance(req, res, next) {
    const { employee_id, date, status } = req.body;
    const errors = [];

    if (!employee_id || typeof employee_id !== 'string' || !employee_id.trim()) {
        errors.push('Employee ID is required');
    }

    if (!date || typeof date !== 'string' || !date.trim()) {
        errors.push('Date is required');
    } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date.trim())) {
            errors.push('Date must be in YYYY-MM-DD format');
        }
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
        errors.push('Status is required');
    } else if (!['Present', 'Absent'].includes(status.trim())) {
        errors.push('Status must be either "Present" or "Absent"');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req.body.employee_id = employee_id.trim();
    req.body.date = date.trim();
    req.body.status = status.trim();

    next();
}

module.exports = { validateEmployee, validateAttendance };
