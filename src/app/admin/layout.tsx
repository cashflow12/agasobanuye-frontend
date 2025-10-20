"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}