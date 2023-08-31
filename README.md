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
    "website": Website,
    "token": ExternalJWT
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

## Install

```bash
pnpm install
```

## Run production server

```bash
pnpm build
pnpm start
```

## Generate RSA keys

```bash
pnpm run generate-keys
```
