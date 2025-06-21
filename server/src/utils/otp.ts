import { createHmac } from "crypto";
import { totp } from "otplib";
import { OTP_SECRET } from "../constants";

const STEP_SECONDS = 120;

totp.options = { step: STEP_SECONDS, digits: 6 };

class OTP {
  private baseSecret: string;

  constructor() {
    this.baseSecret = OTP_SECRET;
  }

  private secretForUser(username: string): string {
    return createHmac("sha1", this.baseSecret)
      .update(username.toLowerCase())
      .digest("hex");
  }

  generate(username: string): string {
    return totp.generate(this.secretForUser(username));
  }

  verify(username: string, code: string): boolean {
    const secret = this.secretForUser(username);
    return totp.check(code, secret);
  }
}

export default new OTP();
