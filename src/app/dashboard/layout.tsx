import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* 因為 Sidebar 是 fixed，所以這裡要留白 (margin-left: 16rem = 64) */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}