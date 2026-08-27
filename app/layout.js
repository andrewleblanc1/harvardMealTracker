import "./globals.css";

// Page metadata (title/description) used for the browser tab and SEO/social
// previews across every route, since Next.js applies this at the root.
export const metadata = {
  title: "Harvard Dining",
  description: "Pick a Harvard dining hall to see what's on the menu.",
};

// Wraps every page in the shared HTML shell (styles, <main> container) so
// individual pages only need to render their own content.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
