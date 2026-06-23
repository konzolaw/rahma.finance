import { redirect } from 'next/navigation';

/**
 * Root page automatically redirects to dashboard.
 * Authentication logic is handled by the middleware.
 */
export default function RootPage() {
  redirect('/dashboard');
}
