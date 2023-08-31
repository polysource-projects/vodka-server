# Vodka API Server

## Start a new authentification

### A - Request Verication Code

#### Request

```http
POST /auth/ask
```
```json
{
    "email": "john.doe@epfl.ch"
}
```

#### Request - 201 OK

```http
Set-Cookie: questionId
```
```json
OK
```

### B - Try Code Attempt & Log in

#### Request

```http
POST /auth/answer
```
```json
{
    "answer": "123456"
}
```

#### Request - 200 OK

```http
Set-Cookie: sessionId
```
```json
OK
```

### C - Fetch user data and website data

#### Request

```http
POST /data?domain=www.google.com
```
```json
```

#### Request - 200 OK

```http
```
```json
{
    "user": User,
    "website": Website
}
```

### D - Logout FROM VODKA

#### Request

```http
POST /auth/logout
```
```json
```

#### Request - 200 OK

```http
```
```json
OK
```

## Generate RSA keys

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```
