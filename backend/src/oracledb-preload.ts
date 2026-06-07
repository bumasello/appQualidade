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

process.on("uncaughtException", (err) => {
  logToFile(`uncaughtException: ${err.stack ?? err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
  logToFile(`unhandledRejection: ${msg}`);
  process.exit(1);
});
