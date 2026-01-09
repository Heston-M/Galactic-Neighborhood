import { getAllPageRoutes, getPageByName, PageFetchError } from "@/services/database/pages";
import { CacheTable, CacheTableEntry, JsonPage, pageTableMap } from "@/types/page";
import { Route, RouteSet } from "@/types/route";
import { constructRoute } from "@/utils/routeParsing";
import { storage } from "@/utils/storage";
import { createContext, useContext, useState } from "react";

type CacheContextShape = {
  getPage: (route: Route) => Promise<JsonPage>;
  getRouteSet: () => Promise<RouteSet>;
}

const CacheContext = createContext<CacheContextShape | undefined>(undefined);

export default function CacheContextProvider({ children }: { children: React.ReactNode }) {
  const [pageCache, setPageCache] = useState<CacheTable>([] as CacheTable);
  const [routeSetCache, setRouteSetCache] = useState<CacheTableEntry>({ name: 'routeSet', age: 0 });

  /**
   * @description
   * Fetches a page from the cache or database
   * @param route - The route of the page to fetch
   * @returns The page data
   * @throws PageFetchError if the page is not found or an error occurs
   */
  const getPage = async (route: Route): Promise<JsonPage> => {
    const requestTime = Date.now();
    const pageRouteString = `page_${constructRoute(route)}`;

    let useCache = false;
    const cachedPageEntry = pageCache.find((entry) => entry.name === pageRouteString);
    if (cachedPageEntry) {
      if (requestTime - cachedPageEntry.age < 1000 * 60 * 60 * 24) { // 24 hours
        cachedPageEntry.age = requestTime;
        setPageCache([...pageCache, cachedPageEntry]);
        useCache = true;
      }
    }

    if (useCache) {
      const cachedPage = await storage.get<JsonPage>(pageRouteString);
      if (cachedPage) {
        return cachedPage;
      }
    }

    const tableName = pageTableMap[route.topic];
    try {
      const page = await getPageByName(route.pageName, tableName);
      if (page) {
        await storage.set(pageRouteString, page);
        const newCachedPageEntry: CacheTableEntry = {
          name: pageRouteString,
          age: requestTime,
        };
        setPageCache([...pageCache, newCachedPageEntry]);
        return page;
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
    throw new PageFetchError(
      `Page "${route.pageName}" not found in table "${pageTableMap[route.topic]}"`,
      pageTableMap[route.topic],
      route.pageName
    );
  }

  const getRouteSet = async (): Promise<RouteSet> => {
    const requestTime = Date.now();

    const useCache = (requestTime - routeSetCache.age < 1000 * 60 * 60 * 24); // 24 hours

    if (useCache) {
      const cachedRouteSet = await storage.get<RouteSet>(routeSetCache.name);
      if (cachedRouteSet) {
        routeSetCache.age = requestTime;
        setRouteSetCache({ ...routeSetCache, age: requestTime });
        return cachedRouteSet;
      }
    }

    const routeSet = await getAllPageRoutes();
    await storage.set(routeSetCache.name, routeSet);
    setRouteSetCache({ ...routeSetCache, age: requestTime });
    return routeSet;
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