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

// Protect routes with JWT authentication
app.get('/protected', auth.verifyToken(), (req, res) => {
  res.send('This is a protected route');
});

// Sample login route
app.post('/login', (req, res) => {
  const user = { id: 1, name: 'Test User' }; // Example user
  const accessToken = auth.generateAccessToken(user);
  const refreshToken = auth.generateRefreshToken(user);

  // Set tokens in cookies
  res.cookie('access_token', accessToken, { httpOnly: true });
  res.cookie('refresh_token', refreshToken, { httpOnly: true });
  res.json({ message: 'Logged in successfully' });
});

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out successfully' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```
