import { HttpException, HttpStatus, UnauthorizedException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify, JsonWebTokenError } from 'jsonwebtoken';

export class BadJWTError extends HttpException {
  constructor() {
    super('Access token is malformed and therefore not valid.', HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new BadJWTError();

      const token = authHeader.split(' ')[1];
      verify(token, 'YOUR_SECRET_KEY', (err, decoded) => {
        if (err) throw new BadJWTError();
        // Optionally attach user or payload to request object
        req['user'] = decoded;
        next();
      });
    } catch (error) {
      next(error);
    }
  }
}
