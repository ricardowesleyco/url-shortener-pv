// user.middleware.ts
import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private userService: UsersService,
    ) {}

  async use(req, res: Response, next: NextFunction) {
    
    res.locals.userService = this.userService;
    next();
  }
 

}
