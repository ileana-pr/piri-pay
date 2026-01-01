/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BTC_ADDRESS: string;
  readonly VITE_ETH_ADDRESS: string;
  readonly VITE_SOL_ADDRESS: string;
  readonly VITE_CASHAPP_HANDLE: string;
  readonly VITE_VENMO_HANDLE: string;
  readonly VITE_ZELLE_HANDLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
