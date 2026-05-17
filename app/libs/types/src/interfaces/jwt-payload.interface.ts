export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  iat?: number;
  exp?: number;
}
