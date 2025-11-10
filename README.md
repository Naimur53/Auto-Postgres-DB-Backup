# PostgreSQL Automated Backup Tool

This is a **Node.js tool** that automatically backs up your PostgreSQL database every day. It compresses backups, keeps only a configurable number of recent backups, retries failed backups, and sends email notifications about the backup status.

---

## What it does

- Automatically creates a daily backup of your PostgreSQL database.
- Compresses the backup into a `.gz` file to save space.
- Keeps only the latest N backups (configurable), deleting older backups automatically.
- Retries up to 3 times if a backup fails.
- Sends email notifications for:
  - Backup started
  - Backup succeeded
  - Backup failed
- Works on macOS, Linux, and Windows.

---

## How to Start

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <repo-folder>
```


2. Install dependencies:

```bash
npm install
```
3. Create a .env file with your configuration:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
BACKUP_DIR=./backups
BACKUP_KEEP_COUNT=7
EMAIL_USER=your-email@gmail.com
EMAIL_USER_PASS=your-email-password
```

4. Run the script:

```bash
node main.js
```
