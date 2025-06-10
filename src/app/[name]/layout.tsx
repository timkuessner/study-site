import { AuthProvider } from '../../lib/authContext';

export default function NameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}