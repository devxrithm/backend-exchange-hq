import bcrypt from "bcrypt";

export const ComparePassword = async (password: string, hashpassword: string) =>
  bcrypt.compare(password, hashpassword).catch(() => false);

export const HashPassword = async (HashPassword: string, SaltRound: number) =>
  bcrypt.hash(HashPassword, SaltRound || 10);
