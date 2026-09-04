/**
 * Role-Based Access Control (RBAC) Middleware
 */

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity not established.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
}

/**
 * Ensures that if a student is making the request, they can only access their own studentId.
 * Admin and Faculty bypass this check.
 * 
 * @param {string} paramKey - URL parameter name holding the student ID (e.g. 'studentId' or 'id')
 */
function verifyStudentOwnership(paramKey = 'studentId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity not established.',
      });
    }

    if (req.user.role === 'student') {
      const requestedStudentId = parseInt(req.params[paramKey], 10);
      if (isNaN(requestedStudentId) || requestedStudentId !== req.user.student_id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are only allowed to access your own academic records.',
        });
      }
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
  verifyStudentOwnership,
};
