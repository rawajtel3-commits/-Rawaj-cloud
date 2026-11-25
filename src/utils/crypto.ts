/**
 * Web Crypto & Security Utilities for Rawaj Cloud
 * Supports Client-side Deduplication via SHA-256 and Zero-Knowledge Vault Encryption
 */

export async function calculateFileSha256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function generateSharePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const randomValues = new Uint32Array(10);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 10; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  return password;
}

export async function simulateZeroKnowledgeEncrypt(plaintext: string, secretKeyStr: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  // Use Web Crypto to derive a 256-bit AES-GCM key from PIN/password with PBKDF2
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKeyStr),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    enc.encode(plaintext)
  );

  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const ciphertextHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    ciphertext: ciphertextHex,
    iv: ivHex,
    salt: saltHex,
  };
}
