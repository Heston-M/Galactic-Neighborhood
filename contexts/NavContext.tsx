import defaultPage from "@/constants/defaultPage.json";
import { useCacheContext } from "@/contexts/CacheContext";
import { JsonPage } from "@/types/page";
import { Route, RouteSet } from "@/types/route";
import { Topic } from "@/types/topic";
import { isValidRoute, parseRoute } from "@/utils/routeParsing";
import { RelativePathString, router, usePathname } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

type NavContextShape = {
  currentPage: JsonPage;
  topic: Topic;
  loading: boolean;
  routeSet?: RouteSet;
  menuOpen: boolean;
  setMenuOpen: (menuOpen: boolean) => void;
  navigateTo: (route: string | Route) => void;
  doneLoadingPage: () => void;
}

const NavContext = createContext<NavContextShape | undefined>(undefined);

export default function NavContextProvider({ children }: { children: React.ReactNode }) {
  const globalPath = usePathname();
  const globalRoute = parseRoute(globalPath);
  const topic = globalRoute?.topic ?? "general";
  const pageName = globalRoute?.pageName;

  const { getPage, getRouteSet } = useCacheContext();

  const [currentPage, setCurrentPage] = useState<JsonPage>(defaultPage as JsonPage);
  const [loading, setLoading] = useState(false);
  const [routeSet, setRouteSet] = useState<RouteSet>();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchRouteSet = async () => {
      try {
        setRouteSet(await getRouteSet());
      } catch (error) {
        console.error('Error fetching route set:', error);
      }
    }
    fetchRouteSet();
  }, []);

  const navigateTo = (route: string | Route) => {
    const parsedRoute = typeof route === 'string' ? parseRoute(route) : route;
    if (!parsedRoute || !isValidRoute(parsedRoute)) {
      return;
    }
    setMenuOpen(false);
    setLoading(true);
    setTimeout(() => {
      router.push({
        pathname: `/${parsedRoute.topic}/${parsedRoute.pageName}` as RelativePathString,
      });
      loadPage(parsedRoute);
    }, 500);
  }

  const loadPage = async (route: Route) => {
    setLoading(true);
    try {
      const page = await getPage(route);    // get page from cache or database
      setCurrentPage(page);
    } catch (error) {
      setCurrentPage(defaultPage as JsonPage);
    } finally {
      setTimeout(() => {
        setLoading(false); // if the page takes 10+ seconds to load, show what's there
      }, 10000);
    }
  }

  // called when the page is done loading
  const doneLoadingPage = () => {
    setLoading(false);
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
    <NavContext.Provider value={{ currentPage, topic: topic as Topic, loading, routeSet, menuOpen, setMenuOpen, navigateTo, doneLoadingPage }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNavContext must be used within a NavContextProvider");
  return context;
}