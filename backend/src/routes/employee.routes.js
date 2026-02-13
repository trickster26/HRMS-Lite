const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { validateEmployee } = require('../middleware/validators');

// GET /api/employees - List all employees
router.get('/', (req, res, next) => {
    try {
        const db = getDatabase();
        const employees = db.prepare(`
      SELECT id, employee_id, full_name, email, department, created_at
      FROM employees
      ORDER BY created_at DESC
    `).all();

        res.json({ data: employees, count: employees.length });
    } catch (err) {
        next(err);
    }
});

// GET /api/employees/:employeeId - Get single employee
router.get('/:employeeId', (req, res, next) => {
    try {
        const db = getDatabase();
        const employee = db.prepare(`
      SELECT id, employee_id, full_name, email, department, created_at
      FROM employees
      WHERE employee_id = ?
    `).get(req.params.employeeId);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ data: employee });
    } catch (err) {
        next(err);
    }
});

// POST /api/employees - Create new employee
router.post('/', validateEmployee, (req, res, next) => {
    try {
        const db = getDatabase();
        const { employee_id, full_name, email, department } = req.body;

        // Check for duplicates explicitly for better error messages
        const existingById = db.prepare('SELECT employee_id FROM employees WHERE employee_id = ?').get(employee_id);
        if (existingById) {
            return res.status(409).json({
                error: 'Duplicate Employee ID',
                details: [`Employee with ID "${employee_id}" already exists`]
            });
        }

        const existingByEmail = db.prepare('SELECT email FROM employees WHERE email = ?').get(email);
        if (existingByEmail) {
            return res.status(409).json({
                error: 'Duplicate Email',
                details: [`An employee with email "${email}" is already registered`]
            });
        }

        const stmt = db.prepare(`
      INSERT INTO employees (employee_id, full_name, email, department)
      VALUES (?, ?, ?, ?)
    `);

        const result = stmt.run(employee_id, full_name, email, department);

        const newEmployee = db.prepare(`
      SELECT id, employee_id, full_name, email, department, created_at
      FROM employees
      WHERE id = ?
    `).get(result.lastInsertRowid);

        res.status(201).json({ data: newEmployee, message: 'Employee created successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/employees/:employeeId - Delete employee
router.delete('/:employeeId', (req, res, next) => {
    try {
        const db = getDatabase();
        const employee = db.prepare('SELECT employee_id FROM employees WHERE employee_id = ?').get(req.params.employeeId);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        db.prepare('DELETE FROM employees WHERE employee_id = ?').run(req.params.employeeId);

        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
