# jwt-auth - a simple JWT Authentication for Express

A lightweight JWT authentication library for Express.js, providing an easy-to-use out of the box experience for JWT-based authentication.
This package provides the user with alot of control on how they want to handle their JWT authentication. If you don't want to deal with all the hassle, just a few lines of code can get you up and running.

## Installation

```bash
npm install jwt-auth
```

## Getting started

To start, import the package into your app.

```javascript
import { JwtAuth } from 'jwt-auth';
```

You are going to need to generate a RS256 key pair. You can use https://cryptotools.net/rsagen for quick help.
Then you are going to want to save those to a safe location. An .env file can be a popular choice. You can use the https://www.npmjs.com/package/dotenv package to do that.

## Use case

A new instance requires both keys you generated.

```javascript
const auth = new JwtAuth({ publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY });
```

## Using in express

```javascript
import express from 'express';
import { JwtAuth } from 'jwt-auth';

const app = express();
const auth = new JwtAuth({ publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY });
```

## Making your tokens

Use the generateAccessToken and generateRefreshToken methods to generate your tokens.
These tokens will be handled by the package so you don't have to worry about state management.
The methods take 2 parameters

1. payload - This can be an object or string. It needs to be able to uniquely identify the user.
2. expirationTime - An optional parameter; by default, access is set to 15 minutes, and refresh is set to 1 day. You can adjust it to suit your needs (e.g., '20m', '1h', '60s').

Use the setRefreshCookie method to set the generated refreshToken into a cookie. The method has 2 parameters

1. res - pass the express 'res' into the method
2. config - an optional parameter that provides default settings to your cookie if you don't want to deal with all the hassle.

```javascript
app.post('/login', (req, res) => {
  const user = { id: 1, name: 'Test User' }; // Example user
  auth.generateAccessToken({ payload: user });
  auth.generateRefreshToken({ payload: user });

  // Default settings if no values are passed
  const cookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 1 day in ms
  };

  auth.setRefreshCookie({ res, config: cookieConfig });

  // have client handle assigning the token to the header
  res.json({ token: auth.accessToken });
});
```

## Protecting a route

```javascript
// Protect routes with JWT authentication
app.get('/protected', auth.validateAccessToken(), (req, res) => {
  res.send('This is a protected route');
});
```

## Generating a new token

When an access token is no longer good you'll need to get a new one from the refresh token. If your refresh token is expired or isn't there then you'll be logged out.

```javascript
app.post('/refresh', (req, res) => {
  const { status, message } = auth.checkRefreshCookie({ req });

  if (status === 'error') res.status(401).json({ message });

  auth.generateAccessToken({ payload: message });

  // have client handle assigning the token to the header
  res.send(auth.accessToken);
});
```
