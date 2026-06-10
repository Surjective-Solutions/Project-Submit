import { Inter, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'SubmitX — Learning Management Platform',
  description: 'The complete learning management platform for tuition institutes and educational institutions.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
