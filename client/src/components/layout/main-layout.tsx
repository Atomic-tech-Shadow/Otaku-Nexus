import AppHeader from "./app-header";
import BottomNav from "./bottom-nav";

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export default function MainLayout({ 
  children, 
  showBottomNav = true, 
  className = "" 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-nexus-dark">
      <AppHeader />
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''} ${className}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}