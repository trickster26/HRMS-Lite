const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

// GET /api/dashboard/summary - Dashboard summary stats
router.get('/summary', (req, res, next) => {
    try {
        const db = getDatabase();

        const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;

        const today = new Date().toISOString().split('T')[0];

        const todayAttendance = db.prepare(`
      SELECT
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_today,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_today
      FROM attendance_records
      WHERE date = ?
    `).get(today);

        const departments = db.prepare(`
      SELECT department, COUNT(*) as count
      FROM employees
      GROUP BY department
      ORDER BY count DESC
    `).all();

        const recentEmployees = db.prepare(`
      SELECT employee_id, full_name, department, created_at
      FROM employees
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

        const recentAttendance = db.prepare(`
      SELECT ar.employee_id, e.full_name, ar.date, ar.status
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.employee_id
      ORDER BY ar.created_at DESC
      LIMIT 10
    `).all();

        res.json({
            data: {
                total_employees: totalEmployees,
                present_today: todayAttendance.present_today,
                absent_today: todayAttendance.absent_today,
                departments,
                recent_employees: recentEmployees,
                recent_attendance: recentAttendance
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
