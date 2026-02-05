export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
}

export type UserWithRole = {
  id: string;
  email: string;
  role: UserRole;
};
