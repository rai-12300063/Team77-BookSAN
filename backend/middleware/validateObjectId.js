const mongoose = require('mongoose');

/**
 * Middleware to validate ObjectId parameters
 * Prevents "Cast to ObjectId failed" errors
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        // Check if parameter exists and is not undefined/null
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing ${paramName} parameter`,
                error: `${paramName} cannot be undefined, null, or empty`
            });
        }

        // Check if it's a valid ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`,
                error: `${paramName} must be a valid MongoDB ObjectId (24 hex characters)`
            });
        }

        next();
    };
};

/**
 * Middleware to validate multiple ObjectId parameters
 */
const validateObjectIds = (...paramNames) => {
    return (req, res, next) => {
        const errors = [];

        paramNames.forEach(paramName => {
            const id = req.params[paramName];
            
            if (!id || id === 'undefined' || id === 'null') {
                errors.push(`${paramName} cannot be undefined, null, or empty`);
            } else if (!mongoose.Types.ObjectId.isValid(id)) {
                errors.push(`${paramName} must be a valid MongoDB ObjectId`);
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: errors
            });
        }

        next();
    };
};

/**
 * Middleware to validate query parameters that should be ObjectIds
 */
const validateQueryObjectIds = (...queryNames) => {
    return (req, res, next) => {
        const errors = [];

        queryNames.forEach(queryName => {
            const id = req.query[queryName];
            
            if (id && id !== 'undefined' && id !== 'null') {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    errors.push(`Query parameter ${queryName} must be a valid MongoDB ObjectId`);
                }
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: errors
            });
        }

        next();
    };
};

module.exports = {
    validateObjectId,
    validateObjectIds,
    validateQueryObjectIds
};