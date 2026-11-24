export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#f6f7f5] text-[#18231f]">{children}</div>;
}
