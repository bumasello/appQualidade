import Module from "module";
import { appendFileSync } from "fs";

function logToFile(message: string) {
  if (process.env.LOG_FILE) {
    try {
      appendFileSync(
        process.env.LOG_FILE,
        `[backend] ${new Date().toISOString()} ${message}\n`,
      );
    } catch {
      // ignora
    }
  }
}

logToFile("preload carregado");
logToFile(`ORACLEDB_PATH=${process.env.ORACLEDB_PATH}`);

process.on("uncaughtException", (err) => {
  logToFile(`uncaughtException: ${err.stack ?? err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
  logToFile(`unhandledRejection: ${msg}`);
  process.exit(1);
});

const moduleAny = Module as unknown as {
  _resolveFilename: (request: string, ...rest: unknown[]) => string;
};

const origResolve = moduleAny._resolveFilename;

moduleAny._resolveFilename = function (request: string, ...rest: unknown[]) {
  if (request === "oracledb" && process.env.ORACLEDB_PATH) {
    logToFile(`resolvendo oracledb -> ${process.env.ORACLEDB_PATH}`);
    return origResolve.call(this, process.env.ORACLEDB_PATH, ...rest);
  }
  return origResolve.call(this, request, ...rest);
};

logToFile("monkey-patch de _resolveFilename instalado");
