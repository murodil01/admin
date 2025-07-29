import { createContext, useContext } from "react";

export const SidebarContext = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);