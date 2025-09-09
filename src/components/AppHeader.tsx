import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Plus, List, User, LogOut, Settings, Menu, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Nova PRT", url: "/nova-prt", icon: Plus },
  { title: "Lista de Produtividade", url: "/lista", icon: List },
  { title: "Relatórios", url: "/reports", icon: BarChart2 },
];

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-green-600 text-white font-medium hover:bg-green-700" 
      : "hover:bg-green-50 hover:text-green-700 text-gray-700";

  return (
    <header className="h-16 flex items-center justify-between border-b bg-white shadow-sm px-4 sm:px-6">
      {/* Logo e título */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          {/* Logo */}
          <img src="/logo.svg" alt="Prodfisco Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-gray-800">Prodfisco</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {/* Desktop: mostrar botões inline a partir de md */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {!isAdmin && items.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={({ isActive }) =>
                `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${getNavCls({ isActive })}`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.title}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${getNavCls({ isActive })}`
                }
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${getNavCls({ isActive })}`
                }
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Usuários</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile: menu dropdown (hamburger) visível abaixo de md */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isAdmin && items.map((item) => (
                <DropdownMenuItem key={item.title} onClick={() => navigate(item.url)}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.title}
                </DropdownMenuItem>
              ))}
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                    <User className="h-4 w-4 mr-2" />
                    Usuários
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Menu do usuário */}
      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 hover:bg-green-50 p-2 sm:px-3">
              <User className="h-4 w-4" />
              <span className="hidden lg:inline text-sm">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            <DropdownMenuItem onClick={signOut} className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
