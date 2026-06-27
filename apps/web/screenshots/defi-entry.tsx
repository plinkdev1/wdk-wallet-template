import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { DefiDialog } from '@/components/defi-dialog';
createRoot(document.getElementById('root')!).render(
  <DefiDialog chainId="ethereum" accountIndex={0} onClose={() => {}} />,
);
