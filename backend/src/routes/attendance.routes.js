const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { validateAttendance } = require('../middleware/validators');

// GET /api/attendance/:employeeId - Get attendance records for an employee
router.get('/:employeeId', (req, res, next) => {
    try {
        const db = getDatabase();
        const { employeeId } = req.params;
        const { start_date, end_date } = req.query;

        // Verify employee exists
        const employee = db.prepare('SELECT employee_id FROM employees WHERE employee_id = ?').get(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        let query = `
      SELECT id, employee_id, date, status, created_at
      FROM attendance_records
      WHERE employee_id = ?
    `;
        const params = [employeeId];

        // Optional date filtering
        if (start_date) {
            query += ' AND date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY date DESC';

        const records = db.prepare(query).all(...params);

        res.json({ data: records, count: records.length });
    } catch (err) {
        next(err);
    }
});

// GET /api/attendance/summary/:employeeId - Get attendance summary
router.get('/summary/:employeeId', (req, res, next) => {
    try {
        const db = getDatabase();
        const { employeeId } = req.params;

        const employee = db.prepare(
            'SELECT employee_id, full_name FROM employees WHERE employee_id = ?'
        ).get(employeeId);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const summary = db.prepare(`
      SELECT
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as total_present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as total_absent,
        COUNT(*) as total_records
      FROM attendance_records
      WHERE employee_id = ?
    `).get(employeeId);

        res.json({
            data: {
                employee_id: employee.employee_id,
                full_name: employee.full_name,
                ...summary
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/attendance - Mark attendance
router.post('/', validateAttendance, (req, res, next) => {
    try {
        const db = getDatabase();
        const { employee_id, date, status } = req.body;

        // Verify employee exists
        const employee = db.prepare('SELECT employee_id FROM employees WHERE employee_id = ?').get(employee_id);
        if (!employee) {
            return res.status(404).json({
                error: 'Employee not found',
                details: [`No employee found with ID "${employee_id}"`]
            });
        }

        // Check for duplicate attendance
        const existing = db.prepare(
            'SELECT id FROM attendance_records WHERE employee_id = ? AND date = ?'
        ).get(employee_id, date);

        if (existing) {
            // Update existing record
            db.prepare(
                'UPDATE attendance_records SET status = ? WHERE employee_id = ? AND date = ?'
            ).run(status, employee_id, date);

            const updated = db.prepare(
                'SELECT id, employee_id, date, status, created_at FROM attendance_records WHERE employee_id = ? AND date = ?'
            ).get(employee_id, date);

            return res.json({ data: updated, message: 'Attendance updated successfully' });
        }

        const stmt = db.prepare(`
      INSERT INTO attendance_records (employee_id, date, status)
      VALUES (?, ?, ?)
    `);

        const result = stmt.run(employee_id, date, status);

        const newRecord = db.prepare(
            'SELECT id, employee_id, date, status, created_at FROM attendance_records WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json({ data: newRecord, message: 'Attendance marked successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
