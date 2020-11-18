
// A global error handler function that wrap all routes
function globalErrorsHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            if (error.name === "SequelizeValidationError") {
                const errors = error.errors.map(err => err.message);
                res.status(400).json(errors);
            } else {
                return next(error)
            }
        }
    }
};


module.exports = globalErrorsHandler;