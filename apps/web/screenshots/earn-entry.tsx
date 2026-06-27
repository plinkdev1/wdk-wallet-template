import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { AppearanceProvider } from '@/components/appearance-provider';
import { WalletShell } from '@/components/wallet-shell';
createRoot(document.getElementById('root')!).render(
  <AppearanceProvider><WalletShell initialTab="earn" /></AppearanceProvider>,
);
