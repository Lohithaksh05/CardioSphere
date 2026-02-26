import Sidebar from "@/components/Sidebar";
import AuthSync from "@/components/AuthSync";

/**
 * Layout for all authenticated app pages.
 * Renders the sidebar + auth sync wrapper with mesh gradient background.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSync>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 mesh-gradient">
        <Sidebar />
        <main className="lg:pl-72">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </AuthSync>
  );
}
