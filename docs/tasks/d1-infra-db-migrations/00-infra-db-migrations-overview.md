# D1 Infra Db Migrations


## Purpose
Define how database schema migrations are created, applied, and managed across development, CI, and production environments.


## Dependencies
- TASK_11 (Database Package)
- TASK_38 (Environment Management) - for DATABASE_URL handling


## Dependencies

Add to root `package.json` devDependencies:
```json
{
  "devDependencies": {
    "tsx": "^4.7.0",
    "dotenv": "^16.4.0"
  }
}
```
