import { getAllPageRoutes, getPageByName, PageFetchError } from "@/services/database/pages";
import { CacheTable, CacheTableEntry, JsonPage, pageTableMap } from "@/types/page";
import { Route, RouteSet } from "@/types/route";
import { constructRoute } from "@/utils/routeParsing";
import { storage } from "@/utils/storage";
import { createContext, useContext, useEffect, useState } from "react";

type CacheContextShape = {
  getPage: (route: Route) => Promise<JsonPage>;
  getRouteSet: () => Promise<RouteSet>;
}

const CacheContext = createContext<CacheContextShape | undefined>(undefined);

export default function CacheContextProvider({ children }: { children: React.ReactNode }) {
  const [pageTable, setPageTable] = useState<CacheTable>([] as CacheTable);
  const [routeSetCache, setRouteSetCache] = useState<CacheTableEntry>({ name: 'route_set_cache', age: 0 });

  useEffect(() => {
    const fetchPageCache = async () => {
      const cachedPageTable = await storage.get<CacheTable>("page_table");
      if (cachedPageTable) {
        setPageTable(cachedPageTable);
      }
    }
    const fetchRouteSetCache = async () => {
      const cachedRouteSetEntry = await storage.get<CacheTableEntry>(routeSetCache.name);
      if (cachedRouteSetEntry) {
        setRouteSetCache(cachedRouteSetEntry);
      }
    }
    fetchPageCache();
    fetchRouteSetCache();
  }, []);

  // save the page cache to storage when it changes
  useEffect(() => {
    storage.set("page_table", pageTable);
  }, [pageTable]);

  // save the route set cache to storage when it changes
  useEffect(() => {
    storage.set(routeSetCache.name, routeSetCache);
  }, [routeSetCache]);

  /**
   * @description
   * Fetches a page from the cache or database
   * @param route - The route of the page to fetch
   * @returns The page data
   * @throws PageFetchError if the page is not found or an error occurs
   */
  const getPage = async (route: Route): Promise<JsonPage> => {
    let page: JsonPage | null = null;
    const requestTime = Date.now();
    const pageRouteString = `page_${constructRoute(route)}`;

    let useCache = false;
    const cachedPageEntry = pageTable.find((entry) => entry.name === pageRouteString);
    if (cachedPageEntry && requestTime - cachedPageEntry.age < 1000 * 60 * 60 * 24) { // younger than 24 hours
      useCache = true;
    }

    if (useCache) {
      page = await storage.get<JsonPage>(pageRouteString);
    } else {
      const tableName = pageTableMap[route.topic];
      try {
        page = await getPageByName(route.pageName, tableName);
        if (page) {
          await storage.set(pageRouteString, page);
          setPageTable([...pageTable, { name: pageRouteString, age: requestTime }]);
        }
      } catch (error) {
        if (error instanceof PageFetchError) {
          throw error;
        }
        throw new PageFetchError(
          `Unexpected error fetching page "${route.pageName}" from "${route.topic}": ${error instanceof Error ? error.message : String(error)}`,
          pageTableMap[route.topic],
          route.pageName,
          error
        );
      }
    }

    if (page) {
      setTimeout(() => {
        cleanupPageCache();
      }, 1000 * 10); // 10 seconds
      return page;
    }
    
    throw new PageFetchError(
      `Page "${route.pageName}" not found in table "${pageTableMap[route.topic]}"`,
      pageTableMap[route.topic],
      route.pageName
    );
  }

  const getRouteSet = async (): Promise<RouteSet> => {
    const requestTime = Date.now();

    if (requestTime - routeSetCache.age < 1000 * 60 * 60 * 24) { // 24 hours
      const cachedRouteSet = await storage.get<RouteSet>("route_set");
      if (cachedRouteSet) {
        return cachedRouteSet;
      }
    }

    const routeSet = await getAllPageRoutes();
    await storage.set("route_set", routeSet);
    setRouteSetCache({ ...routeSetCache, age: requestTime });
    return routeSet;
  }

  const cleanupPageCache = () => {
    const now = Date.now();
    setPageTable((currentPageTable) => {
      let newPageTable: CacheTable = [];
      for (const entry of currentPageTable) {
        if (now - entry.age < 1000 * 60 * 60 * 24) { // younger than 24 hours
          newPageTable.push(entry);
        }
        else {
          storage.remove(entry.name);
        }
      }
      return newPageTable;
    });
  }

  return (
    <CacheContext.Provider value={{ getPage, getRouteSet }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCacheContext() {
  const context = useContext(CacheContext);
  if (!context) throw new Error("useCacheContext must be used within a CacheContextProvider");
  return context;
}