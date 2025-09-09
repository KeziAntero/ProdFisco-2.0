import { NavLink, useLocation } from "react-router-dom";
import { Plus, List, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";


import { useAdmin } from "@/hooks/useAdmin";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema PRT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Itens visíveis para usuários comuns */}
              {!isAdmin && (
                <SidebarMenuItem key="nova-prt">
                  <SidebarMenuButton asChild>
                    <NavLink to="/nova-prt" className={getNavCls}>
                      <Plus className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>Nova PRT</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {!isAdmin && (
                <SidebarMenuItem key="lista">
                  <SidebarMenuButton asChild>
                    <NavLink to="/lista" className={getNavCls}>
                      <List className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>Lista de Produtividade</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Item disponível para todos */}
              <SidebarMenuItem key="reports">
                <SidebarMenuButton asChild>
                  <NavLink to="/reports" className={getNavCls}>
                    <List className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>Relatórios</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Itens admin */}
              {isAdmin && (
                <>
                  <SidebarMenuItem key="Painel Administrativo">
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin" end className={getNavCls}>
                        <User className="mr-2 h-4 w-4" />
                        {state !== "collapsed" && <span>Painel Administrativo</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem key="admin-users">
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin/users" className={getNavCls}>
                        <User className="mr-2 h-4 w-4" />
                        {state !== "collapsed" && <span>Gerenciar Usuários</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
              <User className="h-4 w-4" />
              {state !== "collapsed" && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {state !== "collapsed" && <span className="ml-2">Sair</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}