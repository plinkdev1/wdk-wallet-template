import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { BuyDialog } from '@/components/buy-dialog';
createRoot(document.getElementById('root')!).render(
  <BuyDialog chainId="ethereum" address="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" onClose={() => {}} />,
);
