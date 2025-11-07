import {Calendar, Plus, Settings} from "lucide-react";
import {NavLink} from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";

const items = [
  { title: "Sitzungen", url: "/", icon: Calendar },
  { title: "Einstellungen", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={open ? "w-60" : "w-14"}>
      <SidebarContent>
        <div className="p-4 border-b">
          {open && (
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/src/assets/stupa-logo.png" 
                alt="StuPa Logo"
                className="h-8"
              />
              <h2 className="font-semibold text-lg">StuPa Protokoll</h2>
            </div>
          )}
          <Button asChild className="w-full" size={open ? "default" : "icon"}>
            <NavLink to="/new">
              <Plus className="h-4 w-4" />
              {open && <span className="ml-2">Neue Sitzung</span>}
            </NavLink>
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
