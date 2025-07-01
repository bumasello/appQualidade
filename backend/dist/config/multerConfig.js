"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const appError_1 = require("../error/appError");
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const mimes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
    if (mimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new appError_1.AppError("Tipo de ficheiro inválido. Apenas ficheiros excel são permitidos.", 400));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
});
exports.default = upload;
