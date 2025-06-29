import AppHeader from "./app-header";
import BottomNav from "./bottom-nav";

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  className?: string;
  containerClass?: string;
}

export default function MainLayout({ 
  children, 
  showBottomNav = true,
  showHeader = true,
  className = "",
  containerClass = ""
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-animated ${containerClass}`}>
      {showHeader && <AppHeader />}
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''} ${showHeader ? '' : 'pt-0'} ${className}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}