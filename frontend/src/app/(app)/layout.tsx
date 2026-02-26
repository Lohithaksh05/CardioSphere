import Sidebar from "@/components/Sidebar";
import AuthSync from "@/components/AuthSync";

/**
 * Layout for all authenticated app pages.
 * Renders the sidebar + auth sync wrapper.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSync>
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </AuthSync>
  );
}
