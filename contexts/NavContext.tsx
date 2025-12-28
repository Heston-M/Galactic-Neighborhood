import defaultPage from "@/constants/defaultPage.json";
import { getPageByName } from "@/services/database/pages";
import { JsonPage, pageTableMap } from "@/types/page";
import { isValidRoute, parseRoute } from "@/utils/routeParsing";
import { createContext, useContext, useEffect, useState } from "react";

type NavContextShape = {
  currentPage: JsonPage;
  navigateTo: (pageName: string) => void;
}

const NavContext = createContext<NavContextShape | undefined>(undefined);

export default function NavContextProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<JsonPage>(defaultPage as JsonPage);

  const navigateTo = async (route: string) => {
    const parsedRoute = parseRoute(route);    // parse route
    if (!parsedRoute || !isValidRoute(parsedRoute)) {
      setCurrentPage(defaultPage as JsonPage);
      return;
    }
    const tableName = pageTableMap[parsedRoute.topic];    // get table name from topic
    try {
      const page = await getPageByName(tableName, parsedRoute.pageName);    // get page from table name and page name
      if (!page) {
        setCurrentPage(defaultPage as JsonPage);
        return;
      }
      setCurrentPage(page as JsonPage);
    } catch (error) {
      setCurrentPage(defaultPage as JsonPage);
      return;
    }
  }

  useEffect(() => {
    navigateTo('/general/game-overview');
  }, []);

  return (
    <NavContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNavContext must be used within a NavContextProvider");
  return context;
}