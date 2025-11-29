import { SignJWT, jwtVerify } from "jose";

export const TOKEN_EXPIRED = "TOKEN_EXPIRED";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const REFRESH_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET
);

type JWTPayload = {
  userId: string;
  username: string;
  role: string;
};

type JWTRefreshPayload = {
  userId: string;
};

export async function signJWT(payload: JWTPayload, expiresIn: string = "15m") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

export async function signRefreshToken(payload: JWTRefreshPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(REFRESH_SECRET_KEY);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}
