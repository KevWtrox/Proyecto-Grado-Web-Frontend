import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Music, Drum, BookOpen, UserPlus, Brain, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/core/store/userStore';
import { logout } from '@/features/auth/services/auth.service';

interface MainLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/estudiantes',        icon: Users,           label: 'Lista de Estudiantes' },
  { path: '/ejercicios',         icon: Music,           label: 'Ejercicios de Solfeo' },
  { path: '/ejercicios/ritmica', icon: Drum,            label: 'Ejercicios de Rítmica' },
  { path: '/practicas',          icon: BookOpen,        label: 'Prácticas' },
  { path: '/solicitudes',        icon: UserPlus,        label: 'Solicitudes de Incorporación' },
  { path: '/analitica',          icon: Brain,           label: 'Analítica CNN' },
];

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((s) => s.user);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-[#1a1f1c]">
      <aside className="w-64 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border flex flex-col shadow-xl shrink-0">

        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
              <Music className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sidebar-foreground tracking-wide">TÓNICA</h2>
              <p className="text-xs text-muted-foreground">Sistema Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-5">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full h-11 justify-start gap-3 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sidebar-primary to-accent text-sidebar-primary-foreground hover:from-accent hover:to-sidebar-primary shadow-md shadow-sidebar-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User + logout */}
        <div className="p-4 border-t border-sidebar-border">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center text-sm font-bold text-sidebar-primary shrink-0">
                {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.correo}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
