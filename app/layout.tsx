import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth';
import { StoreProvider } from '@/lib/store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusStore — Your Ultimate Gaming Marketplace',
  description: 'Discover, buy, and play thousands of games from the world\'s best developers. The ultimate gaming marketplace with exclusive deals and instant delivery.',
  keywords: 'games, gaming, marketplace, buy games, PC games, steam alternative',
  openGraph: {
    title: 'NexusStore — Your Ultimate Gaming Marketplace',
    description: 'Discover, buy, and play thousands of games.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050508] text-white antialiased`}>
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                },
              }}
            />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
