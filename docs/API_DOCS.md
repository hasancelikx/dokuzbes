# API Endpoints Dökümentasyonu

## Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
}
```

### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}

Response (200):
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc..."
  }
}
```

## Users

### Get Profile
```
GET /api/users/profile
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "created_at": "2024-05-22T10:00:00Z"
  }
}
```

### Update Profile
```
PUT /api/users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Health Check

### API Health
```
GET /health

Response (200):
{
  "status": "OK",
  "timestamp": "2024-05-22T10:00:00Z"
}
```

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
