"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const vinculoMedicoRouter_1 = __importDefault(require("./router/vinculoMedicoRouter"));
class App {
    app;
    port;
    constructor(port = 3001) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initMiddleware();
        this.initRoute();
        this.initErrorHandler();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Api on air.");
        });
    }
    getPort() {
        return this.port;
    }
    initRoute() {
        this.app.use("/vinculomedico", vinculoMedicoRouter_1.default);
    }
    initMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
    }
    initErrorHandler() {
        this.app.use(errorHandler_1.default);
    }
}
exports.default = App;
