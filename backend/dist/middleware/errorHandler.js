"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("../error/appError");
const errorHandler = (err, req, res, next) => {
    console.error("[Error Handler]", err);
    if (err instanceof appError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    res.status(500).json({ success: false, message: "Erro interno do servidor" });
};
exports.default = errorHandler;
