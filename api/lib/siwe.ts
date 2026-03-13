import {
  generateSiweNonce,
  parseSiweMessage,
  validateSiweMessage,
} from 'viem/siwe';
import { verifyMessage } from 'viem';

const DOMAIN = process.env.SIWE_DOMAIN || 'localhost';

export type SiweChain = 'ethereum' | 'base';

/** generate nonce for client */
export function createNonce(): string {
  return generateSiweNonce();
}

/** verify signed message and return address if valid */
export async function verifySiwe(params: {
  message: string;
  signature: `0x${string}`;
  nonce: string;
  domain?: string;
}): Promise<{ address: `0x${string}`; chainId: number } | null> {
  const parsed = parseSiweMessage(params.message);
  if (!parsed.address || !parsed.nonce || !parsed.chainId) return null;

  const domain = params.domain ?? DOMAIN;
  const isValidFormat = validateSiweMessage({
    message: parsed,
    nonce: params.nonce,
    domain,
    time: new Date(),
  });
  if (!isValidFormat) return null;

  const isValidSig = await verifyMessage({
    address: parsed.address as `0x${string}`,
    message: params.message,
    signature: params.signature,
  });
  if (!isValidSig) return null;

  return {
    address: parsed.address as `0x${string}`,
    chainId: Number(parsed.chainId),
  };
}

export function chainIdToChain(chainId: number): SiweChain {
  if (chainId === 1) return 'ethereum';
  return 'base';
}
