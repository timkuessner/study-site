import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: "Study",
  description: "Study more!",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}