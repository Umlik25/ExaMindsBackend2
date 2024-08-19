export interface AuthenticatedUser {
  readonly id: number;
  readonly name: string;
  readonly phonenumber: string;
  readonly email: string;
  readonly password: string;
  readonly parentnumber: string;
  readonly accessToken: string;
}
