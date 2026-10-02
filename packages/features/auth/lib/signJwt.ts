import process from "node:process";
import { WEBSITE_URL } from "@calcom/lib/constants";
import { jwtVerify, SignJWT } from "jose";

const getSecret = (): Uint8Array => new TextEncoder().encode(process.env.CALENDSO_ENCRYPTION_KEY);

const signJwt = async (payload: { email: string }): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.email)
    .setIssuedAt()
    .setIssuer(WEBSITE_URL)
    .setAudience(`${WEBSITE_URL}/auth/login`)
    .setExpirationTime("2m")
    .sign(getSecret());
};

/** Returns the email from a token issued by signJwt, or null if it is invalid or expired. */
export const verifyTotpLoginJwt = async (token: string): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: WEBSITE_URL,
      audience: `${WEBSITE_URL}/auth/login`,
      algorithms: ["HS256"],
    });
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
};

export default signJwt;
