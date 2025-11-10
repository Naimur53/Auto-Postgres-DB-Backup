import dotenv from "dotenv";
dotenv.config();

const config = {
    databaseUrl: process.env.DATABASE_URL,
    backupDir: process.env.BACKUP_DIR|| "./backups",
    backupKeepCount: process.env.BACKUP_KEEP_COUNT,
    emailUser: process.env.EMAIL_USER,
    emailUserPass: process.env.EMAIL_USER_PASS,
};
export default config;
