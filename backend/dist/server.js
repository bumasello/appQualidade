"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = __importDefault(require("./App"));
const oracleDatabase_1 = __importDefault(require("./database/oracleDatabase"));
const app = new App_1.default(8080);
(async () => {
    try {
        await oracleDatabase_1.default.initPool();
        app.listen();
    }
    catch (error) {
        console.error("Erro ao iniciar pool Oracle.", error);
        process.exit(1);
    }
})();
