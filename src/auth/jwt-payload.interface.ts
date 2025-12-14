import { Role } from "./enums/role.enum";

// auth/jwt-payload.interface.ts
export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}
