import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import os from "os";  
import zlib from "zlib";
import config from "./config.js";
import genericEmailTemplate from "./shared/genericEmailTemplate.js";
import sendEmail from "./utils/sendEmail.js";
// ---- Configuration ----
 
console.log("Loaded DATABASE_URL:", config.databaseUrl);

const dbUrl = new URL(config.databaseUrl);
const PG_HOST = dbUrl.hostname;
const PG_PORT = dbUrl.port || 5432;
const PG_USER = decodeURIComponent(dbUrl.username);
const PG_PASSWORD = decodeURIComponent(dbUrl.password);
const PG_DATABASE = dbUrl.pathname.replace("/", "");


const { backupDir: BACKUP_DIR, backupKeepCount: BACKUP_KEEP_COUNT } = config;
if (!PG_HOST || !PG_USER || !PG_PASSWORD || !PG_DATABASE) {
  console.error("❌ Missing database credentials in .env file");
  process.exit(1);
}

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ---- Helper: run a shell command ----
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout);
    });
  });
}

// ---- Helper: compress .sql to .gz ----
function compressFile(filePath) {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(filePath);
    const destination = fs.createWriteStream(`${filePath}.gz`);

    source
      .pipe(gzip)
      .pipe(destination)
      .on("finish", () => {
        fs.unlinkSync(filePath); // remove original
        resolve(`${filePath}.gz`);
      })
      .on("error", reject);
  });
}

// ---- Helper: delete old backups ----
function cleanOldBackups() {
  if (!parseInt(BACKUP_KEEP_COUNT)) return; // skip if not set

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".gz"))
    .map((f) => ({ file: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
    .sort((a, b) => b.time - a.time); // newest first

  if (files.length > parseInt(BACKUP_KEEP_COUNT)) {
    const toDelete = files.slice(parseInt(BACKUP_KEEP_COUNT));
    toDelete.forEach(({ file }) => {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
      console.log(`🧹 Deleted old backup: ${file}`);
    });
  }
}

// ---- Main backup function ----
async function runBackup(retry = 0) {
  const date = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
  const sqlFile = path.join(BACKUP_DIR, `backup-${date}.sql`);
  const isWindows = os.platform().startsWith("win");

  const cmd = isWindows
    ? `set PGPASSWORD=${PG_PASSWORD} && pg_dump -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -F c -f "${sqlFile}"`
    : `PGPASSWORD="${PG_PASSWORD}" pg_dump -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${PG_DATABASE} -F c -f "${sqlFile}"`;

  console.log(`\n[${new Date().toLocaleString()}] 🟢 Starting backup...`);

  try {
    // send email
    await sendEmail({
      to: config.emailUser,
      
    },{
        subject: "Database Backup started",
        html: genericEmailTemplate({
            backupStatus: "Pending",
            backupFileName: sqlFile,
            completedAt: new Date().toLocaleString(),
          }),
    });
    await execCommand(cmd);
    const gzFile = await compressFile(sqlFile);
    console.log(`✅ Backup completed and compressed: ${gzFile}`);
    // send email
    await sendEmail({
      to: config.emailUser,
      multi: [config.emailUser,"codemyhobby9@gmail.com"],
      
    },{
        subject: "Database Backup completed",
        html: genericEmailTemplate({
            backupStatus: "Success",
            backupFileName: sqlFile,
            completedAt: new Date().toLocaleString(),
          }),
    });
    cleanOldBackups();
  } catch (err) {
    console.error(`❌ Backup failed (attempt ${retry + 1}/3):`, err);
    if (retry < 2) {
      console.log("🔁 Retrying in 10 seconds...");
      setTimeout(() => runBackup(retry + 1), 10_000);
    } else {
      console.error("🚨 Backup failed after 3 attempts.");
      // send email
      await sendEmail({
        to: config.emailUser,
        
      },{
          subject: "Database Backup failed",
          html: genericEmailTemplate({
              backupStatus: "Failed",
              backupFileName: sqlFile,
              completedAt: new Date().toLocaleString(),
            }),
      });
    }
  }
}

cron.schedule("0 0,12 * * *", () => runBackup());


// ---- Run immediately on start (optional) ----
runBackup();
