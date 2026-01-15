import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export async function hashPassword(password: string) {
  return await hash(password);
}

export async function verifyPassword(password: string, hashValue: string) {
  return await compare(password, hashValue);
}
