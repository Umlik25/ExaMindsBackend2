import { IsEmail, IsString, Matches } from 'class-validator';

export class SignupDTO {
  @IsString()
  readonly name: string;

  @Matches(/^\+\d+$/, { message: 'phonenumber must be a valid phone number string starting with + and followed by digits' })
  readonly phonenumber: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @Matches(/^\+\d+$/, { message: 'parentnumber must be a valid phone number string starting with + and followed by digits' })
  readonly parentnumber: string;
}
