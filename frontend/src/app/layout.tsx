import '../core/src/App.css';
import '../core/src/index.css';
import '../market/src/index.css';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}