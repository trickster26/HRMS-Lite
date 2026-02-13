/**
 * Global error handler middleware.
 * Returns structured JSON error responses with appropriate HTTP status codes.
 */
function errorHandler(err, req, res, _next) {
    console.error('Unhandled error:', err.message);

    // SQLite constraint errors
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
        const field = err.message.includes('employee_id') ? 'Employee ID' :
            err.message.includes('email') ? 'Email' : 'Record';
        return res.status(409).json({
            error: `${field} already exists`,
            details: [`A record with this ${field.toLowerCase()} is already registered`]
        });
    }

    // Foreign key errors
    if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(400).json({
            error: 'Invalid reference',
            details: ['The referenced employee does not exist']
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        details: err.details || ['An unexpected error occurred']
    });
}

module.exports = { errorHandler };
