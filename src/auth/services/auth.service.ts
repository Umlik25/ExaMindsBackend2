import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import * as owasp from 'owasp-password-strength-test';
import { ConfigService } from '@nestjs/config';

import { AccountWasDeletedError, PasswordIsWeakError } from '../errors';
import { AuthenticatedUser } from '../interfaces';
import { LoginAuditService } from './login-audit.service';
import { SignupDTO, LoginDTO } from '../dtos';
import { UsersService, User, AccountStates } from '../../users';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly loginAuditService: LoginAuditService,
    private readonly configService: ConfigService,
  ) {}

  public async signUp(signupDTO: SignupDTO): Promise<AuthenticatedUser> {
    this.verifyPasswordStrength(signupDTO.password);

    const user = await this.usersService.createUser(signupDTO);

    return {
      id: user.id,
      name: user.name,
      password: user.password,
      phonenumber: user.phonenumber,  // String
      email: user.email,
      parentnumber: user.parentnumber,  // String
      accessToken: sign({ userId: user.id }, this.configService.get<string>('JWT_SECRET'), { expiresIn: '1h' }),
    };
  }

  private verifyPasswordStrength(password: string) {
    const testResult = owasp.test(password);

    if (testResult.errors.length) {
      throw new PasswordIsWeakError(testResult.errors);
    }
  }

  public async logIn(loginDTO: LoginDTO): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmailAndPassword(loginDTO);

    const canLogIn =
      user.accountState === AccountStates.ACTIVE ||
      user.accountState === AccountStates.INACTIVE;

    if (canLogIn) {
      return await this._proceedWithLogIn(user);
    } else if (user.accountState === AccountStates.DELETED) {
      throw new AccountWasDeletedError();
    }
  }

  private async _proceedWithLogIn(user: User): Promise<AuthenticatedUser> {
    await this.loginAuditService.recordLogin(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phonenumber: user.phonenumber,  // String
      password: user.password,
      parentnumber: user.parentnumber,  // String
      accessToken: sign({ userId: user.id }, this.configService.get<string>('JWT_SECRET'), { expiresIn: '1h' }),
    };
  }
}
