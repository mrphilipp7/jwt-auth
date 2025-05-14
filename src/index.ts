import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { CookieOptions, Response, Request, NextFunction } from 'express';

interface IJwtAuth {
  publicKey: string;
  privateKey: string;
}

type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y';
type TimeString = `${number}${TimeUnit}`;

interface ITokenDetails {
  payload: string | Buffer | object;
  expirationTime?: TimeString;
}

const COOKIE_DEFAULT_CONFIG: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60 * 24, // 1 day in ms
};

export class JwtAuth {
  private _accessToken: string = '';
  private _refreshToken: string = '';

  constructor(private config: IJwtAuth) {
    this.config.privateKey = config.privateKey;
    this.config.publicKey = config.publicKey;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  generateAccessToken({
    payload,
    expirationTime = '15m',
  }: ITokenDetails): void {
    this._accessToken = jwt.sign(payload, this.config.privateKey, {
      algorithm: 'RS256',
      expiresIn: expirationTime,
    });
  }

  generateRefreshToken({
    payload,
    expirationTime = '1d',
  }: ITokenDetails): void {
    this._refreshToken = jwt.sign(payload, this.config.privateKey, {
      algorithm: 'RS256',
      expiresIn: expirationTime,
    });
  }

  setRefreshCookie({
    res,
    config = COOKIE_DEFAULT_CONFIG,
  }: {
    res: Response;
    config?: CookieOptions;
  }): Response {
    return res.cookie('refresh_token', this._refreshToken, config);
  }

  checkRefreshCookie({ req }: { req: Request }): {
    status: string;
    message: string | jwt.JwtPayload;
  } {
    try {
      const cookies = this.parseCookies(req);
      const cookie = cookies['refresh_token'];

      if (!cookie)
        return { status: 'error', message: 'cookie is missing or expired' };

      const decoded = jwt.verify(cookie, this.config.publicKey, {
        algorithms: ['RS256'],
      });

      return { status: 'success', message: decoded };
    } catch (e) {
      return { status: 'error', message: 'error decoding the JWT' };
    }
  }

  validateAccessToken() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const cookies = this.parseCookies(req);
        const token = cookies['access_token'] || this.extractBearerToken(req);

        if (!token) {
          res.status(401).json({ message: 'Access token missing' });
          return;
        }

        const decoded = this.verifyToken(token);

        req.user = decoded;
        next();
      } catch (e) {
        res
          .status(403)
          .json({ message: 'Invalid or expired access token', error: e });
        return;
      }
    };
  }

  private extractBearerToken(req: Request): string | null {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader !== 'string') return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return null;
    }

    return parts[1];
  }

  private verifyToken(token: any): jwt.JwtPayload {
    return jwt.verify(token, this.config.publicKey, {
      algorithms: ['RS256'],
    }) as JwtPayload;
  }

  private parseCookies(req: Request): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieHeader = req.headers['cookie'];

    if (!cookieHeader) {
      return cookies;
    }

    cookieHeader.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=').map((part) => part.trim());

      // Ensure both key and value are defined
      if (key && value) {
        cookies[key] = value;
      }
    });

    return cookies;
  }
}
