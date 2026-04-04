import './globals.css';

export const metadata = {
  title: 'Admiral CMS',
  description: 'Admiral Bet Content Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
