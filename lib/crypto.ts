import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  const salt = process.env.ENCRYPTION_SALT;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (!salt) {
    throw new Error("ENCRYPTION_SALT environment variable is not set");
  }
  // Ensure key is exactly 32 bytes
  return crypto.scryptSync(key, salt, KEY_LENGTH);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

/**
 * Decrypts data that was encrypted with the encrypt function
 */
export function decrypt(encryptedData: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, "hex");
  const authTag = Buffer.from(encryptedData.authTag, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypts API credentials for storage
 */
export function encryptCredentials(apiKey: string, apiSecret: string) {
  const keyData = encrypt(apiKey);
  const secretData = encrypt(apiSecret);

  return {
    encryptedApiKey: `${keyData.encrypted}:${keyData.authTag}`,
    encryptedApiSecret: `${secretData.encrypted}:${secretData.authTag}`,
    iv: keyData.iv, // Store one IV, or store both if preferred
    ivSecret: secretData.iv,
  };
}

/**
 * Decrypts stored API credentials
 */
export function decryptCredentials(
  encryptedApiKey: string,
  encryptedApiSecret: string,
  iv: string,
  ivSecret: string
): { apiKey: string; apiSecret: string } {
  const [keyEncrypted, keyAuthTag] = encryptedApiKey.split(":");
  const [secretEncrypted, secretAuthTag] = encryptedApiSecret.split(":");

  const apiKey = decrypt({
    encrypted: keyEncrypted,
    iv,
    authTag: keyAuthTag,
  });

  const apiSecret = decrypt({
    encrypted: secretEncrypted,
    iv: ivSecret,
    authTag: secretAuthTag,
  });

  return { apiKey, apiSecret };
}
