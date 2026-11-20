import { PageTransitionProvider } from '@/components/PageTransition';

// The page transition lives here, so it stays mounted while the directory page changes into a tutor's page.
export default function ClassRecordingsLayout({ children }) {
  return <PageTransitionProvider>{children}</PageTransitionProvider>;
}
