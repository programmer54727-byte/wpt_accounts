import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
