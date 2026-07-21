# Auth Testing Playbook (JWT + Emergent Google Auth)

## Step 1: MongoDB Verification
```
mongosh
use up_analytics
db.users.find({role: "admin"}).pretty()
```
Verify bcrypt hash starts with `$2b$`; indexes on users.email (unique), login_attempts.identifier.

## Step 2: API Testing (JWT)
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@upideias.com","password":"Admin@2026"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
```

## Step 3: Google session testing
Create a test session directly in Mongo:
```
mongosh --eval "
use('up_analytics');
var u = db.users.findOne({email:'creator@upideias.com'});
var tok = 'test_session_' + Date.now();
db.user_sessions.insertOne({user_id: u.user_id, session_token: tok, expires_at: new Date(Date.now()+7*24*3600*1000).toISOString(), created_at: new Date().toISOString()});
print('Token: ' + tok);"
```
Then: `curl http://localhost:8001/api/auth/me -H "Authorization: Bearer <TOKEN>"`

## Browser testing
Set cookie `session_token=<TOKEN>` (httpOnly, secure, sameSite None) on the preview domain and load /app/dashboard.

Success: /api/auth/me returns user; dashboard loads without redirect to /login.
