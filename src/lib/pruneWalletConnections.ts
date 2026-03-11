import type { Connector } from 'wagmi';

/**
 * when user connects with base account (google sign-in), wagmi can still
 * hold a second connection (e.g. metamask). that leaves window.ethereum
 * and chain events tied to the wrong wallet → wrong network warnings.
 * disconnect every connector except the keeper so only one session remains.
 */
export const BASE_ACCOUNT_CONNECTOR_ID = 'baseAccount';

export async function disconnectAllExcept(
  connections: { connector: Connector }[],
  keeperConnectorId: string,
  // wagmi useDisconnect: use mutateAsync (disconnectAsync is deprecated)
  mutateAsync: (args: { connector: Connector }) => Promise<unknown>,
): Promise<void> {
  const others = connections.filter((c) => c.connector.id !== keeperConnectorId);
  for (const c of others) {
    try {
      await mutateAsync({ connector: c.connector });
    } catch {
      // already disconnected or provider refused — continue pruning
    }
  }
}
