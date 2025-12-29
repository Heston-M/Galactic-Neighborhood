import defaultPage from "@/constants/defaultPage.json";
import { getPageByName as getPageByNameService } from "@/services/database/pages";
import { JsonPage, pageTableMap } from "@/types/page";
import { Route } from "@/types/route";
import { Topic } from "@/types/topic";
import { isValidRoute, parseRoute } from "@/utils/routeParsing";
import { RelativePathString, router, usePathname } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

type NavContextShape = {
  currentPage: JsonPage;
  topic: Topic;
  loading: boolean;
  navigateTo: (route: string | Route) => void;
}

const NavContext = createContext<NavContextShape | undefined>(undefined);

export default function NavContextProvider({ children }: { children: React.ReactNode }) {
  const globalPath = usePathname();
  const globalRoute = parseRoute(globalPath);
  const topic = globalRoute?.topic ?? "general";
  const pageName = globalRoute?.pageName;

  const [currentPage, setCurrentPage] = useState<JsonPage>(defaultPage as JsonPage);
  const [loading, setLoading] = useState(false);

  const navigateTo = (route: string | Route) => {
    const parsedRoute = typeof route === 'string' ? parseRoute(route) : route;
    if (!parsedRoute || !isValidRoute(parsedRoute)) {
      return;
    }
    setLoading(true);
    router.push({
      pathname: `/${parsedRoute.topic}/${parsedRoute.pageName}` as RelativePathString,
    });
    loadPage(parsedRoute);
  }

  const loadPage = async (route: Route) => {
    setLoading(true);
    const tableName = pageTableMap[route.topic];    // get table name from topic
    try {
      const page = await getPageByNameService(route.pageName, tableName);    // get page from table name and page name
      if (page) {
        setCurrentPage(page as JsonPage);
      } else {
        setCurrentPage(defaultPage as JsonPage);
      }
    } catch (error) {
      setCurrentPage(defaultPage as JsonPage);
    } finally {
      setLoading(false);
    }
  }

  // if the topic or page name changes unexpectedly, load the new page
  useEffect(() => {
    if (loading) {
      return;
    }
    const topicStr = Array.isArray(topic) ? topic[0] : topic;
    const pageNameStr = Array.isArray(pageName) ? pageName[0] : pageName;
    
    if (topicStr && pageNameStr && currentPage.topic !== topicStr && currentPage.title !== pageNameStr) {
      setLoading(true);
      loadPage({ topic: topicStr as Topic, pageName: pageNameStr });
    }
    else {
      if (currentPage.topic !== topicStr || currentPage.title !== pageNameStr) {
        setCurrentPage(defaultPage as JsonPage);
        setLoading(false);
      }
    }
  }, [topic, pageName]);

  return (
    <NavContext.Provider value={{ currentPage, topic: topic as Topic, loading, navigateTo }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNavContext must be used within a NavContextProvider");
  return context;
}