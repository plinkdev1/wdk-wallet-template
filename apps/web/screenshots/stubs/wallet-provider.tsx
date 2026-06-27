import type { ReactNode } from 'react';
export function WalletProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
export function useWallet() { return { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' } as never; }
