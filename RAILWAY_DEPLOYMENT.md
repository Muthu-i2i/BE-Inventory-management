# Railway Deployment Guide with SQLite

## Important Note About SQLite on Railway
Since Railway deployments are ephemeral (they can restart or redeploy), the SQLite database file will be recreated on each deployment. This means:
- The database will reset on each deployment
- Data won't persist between deployments
- Good for testing/demo purposes
- Not recommended for production data that needs to persist

## Deployment Steps

### 1. Environment Variables
Add these in Railway dashboard:
```
NODE_ENV=production
JWT_SECRET=your-secure-secret-here
CORS_ORIGIN=your-frontend-url
DATABASE_URL="file:./dev.sqlite"
```

### 2. Initial Setup
The database will be automatically created on first run. You might want to add some initial seed data using:
```bash
railway run npm run db:init
```

### 3. Monitoring
- Check application logs in Railway dashboard
- Monitor API endpoints
- Watch for any database-related errors

## Best Practices with SQLite on Railway

1. Data Persistence Strategy:
   - Use seed scripts to initialize data
   - Implement backup mechanisms if needed
   - Consider switching to PostgreSQL for persistent data

2. Performance:
   - Keep database size small
   - Implement proper indexing
   - Regular cleanup of old data

3. Error Handling:
   - Handle database connection errors
   - Implement retry mechanisms
   - Log database operations

## Alternative Recommendations
If you need data persistence, consider:
1. Switching to PostgreSQL (Railway provides this)
2. Using external file storage for the SQLite file
3. Implementing backup/restore mechanisms

## Support
- Railway Documentation: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway