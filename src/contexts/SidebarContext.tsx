import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  sidebarWidth: number;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  sidebarWidth: 256,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, sidebarWidth, setIsCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
