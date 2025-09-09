import { AppHeader } from "@/components/AppHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-[1900px] mx-auto">
      <AppHeader />
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}