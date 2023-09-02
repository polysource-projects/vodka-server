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

#### Response - 201 OK

```http
Set-Cookie: questionId
```

```
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

#### Response - 200 OK

```http
Set-Cookie: sessionId
```

```
OK
```

### C - Fetch user data and website data

#### Request

```http
POST /data?domain=www.google.com
```

#### Response - 200 OK

```json
{
	"user": {
		"email": "john.doe@epfl.ch"
	},
	"website": {
		"name": "Google",
		"domain": "www.google.com"
	},
	"token": "xxx.yyy.zzz"
}
```
`website` and `token` are only non-null if `domain` is registered as a verified website.

### D - Logout FROM VODKA

#### Request

```http
POST /auth/logout
```

#### Response - 200 OK

```http
Set-Cookie: sessionId; MaxAge=-1
```

```
OK
```

### E - Validate any signed Vodka session token

#### Request

```http
GET /public-key
```

#### Response - 200 OK


```txt
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxtpolRhOgtz05Ylj9CU4
st3VC2BcsbeiHcv/DhOLWzaLGBi3sS+ZZS7GUHhhKDgZ6sgFoABV+dMOGGjJJ9y1
+EH79LvwI0kJ+gqdzg7oeFGmJcwj8wyS02AMkTknv4lckgk+2aMCWRFFRoBP/i4g
ligZz59uherBM8goxVToq4XLlIAVbWlSW43ohXRfkRmLHT9z61thw5B/3DF3dMui
7Q5DewIt+REibiLygXf3RVuw13kTvMC+WA632cy0o+AVmJ+8e/oHM2mT/weahjAZ
TNwLS09SakuKacIT+TH/OVHXpSo13m810NgXl5MkcVsoz0+JANOVG4kOA4uY33Ru
j6RPurqOSmoMwnymoJJBNW6fXHC50HBVmFKS34JFhBd4Nmko8PPjq9SVeQSv4Y8d
kFN73vD4XWYbTuvx8z+Zw33pIQD7EmFDDAELusBLQoQp3aU4uNrFOCdKsjZ3l2mG
Vd0652KpAl29IuTUG1DLGJJpiz076V4RRg24BphOnP88/2OEq6+mFAmessHCLhzZ
s/LcAA6HL1urZYgbNycRuIRPk3RSvy/z9idjfrnRgcPFZSlCIPuNloUL6TqVkQln
sumxXQYXRpuINr1OL4r2goMx9KjJrNF4jSkCV8Is9EkzvaQhvnWrSVWIv/xd65om
YHiuMU3YNbK6bGrMzghxpocCAwEAAQ==
-----END PUBLIC KEY-----
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
