# Database Setup for Perfect DocStudio

This directory contains the database setup scripts for the Perfect DocStudio application.

## Prerequisites

- PostgreSQL 12 or higher
- Access to create databases and users
- psql command-line tool or pgAdmin

## Installation Steps

### 1. Create Database

```sql
CREATE DATABASE perfect_docstudio;
```

### 2. Connect to Database

```bash
psql -d perfect_docstudio
```

### 3. Run Setup Script

```sql
\i database/setup.sql
```

Or copy and paste the contents of `setup.sql` directly into your PostgreSQL client.

## Database Schema

### Tables

#### `campaigns`
Stores campaign information including:
- Basic campaign details (name, description)
- Template configuration (email/SMS templates)
- Campaign status and statistics
- Audit information (created by, timestamps)

#### `campaign_records`
Stores individual CSV row data for each campaign:
- JSONB storage for flexible CSV column structure
- Transaction status tracking
- Error messages and timestamps

### Indexes
- Performance indexes on frequently queried fields
- Status-based indexes for campaign filtering
- Foreign key indexes for relationship queries

### Triggers
- Automatic `updated_at` timestamp updates
- Data integrity constraints

## Sample Data

The setup script includes sample campaign data to help you get started:
- Welcome Campaign 2024 (completed)
- Newsletter Q1 2024 (active)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/perfect_docstudio
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perfect_docstudio
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### User Permissions

Ensure your database user has the necessary permissions:

```sql
GRANT ALL PRIVILEGES ON TABLE campaigns TO your_app_user;
GRANT ALL PRIVILEGES ON TABLE campaign_records TO your_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
```

## Backup and Restore

### Backup
```bash
pg_dump -d perfect_docstudio > backup.sql
```

### Restore
```bash
psql -d perfect_docstudio < backup.sql
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your user has CREATE TABLE privileges
2. **UUID Extension**: Make sure `uuid-ossp` extension is available
3. **Connection Issues**: Verify database host, port, and credentials

### Reset Database

To completely reset the database:

```sql
DROP TABLE IF EXISTS campaign_records CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Then re-run the setup script.

## Development

For development environments, you can use Docker:

```bash
# Start PostgreSQL container
docker run --name postgres-docstudio \
  -e POSTGRES_DB=perfect_docstudio \
  -e POSTGRES_USER=docstudio \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# Run setup script
docker exec -i postgres-docstudio psql -U docstudio -d perfect_docstudio < database/setup.sql
```

## Production Considerations

- Use connection pooling (e.g., PgBouncer)
- Implement proper backup strategies
- Monitor database performance
- Consider read replicas for high-traffic scenarios
- Implement proper security measures (SSL, firewall rules)
