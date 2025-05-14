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

You are going to need to generate a rs256 key pair. You can use https://cryptotools.net/rsagen for quick help.
Then you are going to want to save those to a save location. An .env file can be a popular choice and you can use the https://www.npmjs.com/package/dotenv package to do that.

## Use case

A new instance requires both keys you generated.

```javascript
const auth = new JwtAuth({ publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY });
```
