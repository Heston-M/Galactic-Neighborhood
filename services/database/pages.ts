import defaultPage from '@/constants/defaultPage.json';
import { supabase } from '@/lib/supabase/client';
import { PageTableName } from '@/types/database';
import { JsonPage, pageTableMap } from '@/types/page';
import { RouteSet } from '@/types/route';
import { parseRoute } from '@/utils/routeParsing';


/**
 * Error class for page-related API errors
 */
export class PageFetchError extends Error {
  constructor(
    message: string,
    public readonly tableName: string,
    public readonly pageName: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PageFetchError';
  }
}

/**
 * Fetches a page from the specified table
 * 
 * @param tableName - The name of the table to query, if not provided, all page tables will be searched
 * @param pageName - The unique name of the page to fetch
 * @returns Promise that resolves to the JsonPage data
 * @throws PageFetchError if the page is not found or an error occurs
 * 
 * @example
 * ```typescript
 * const page = await getPageByName('rules_pages', 'combat-intro');
 * ```
 */
export async function getPageByName(
  pageName: string,
  tableName?: PageTableName
): Promise<JsonPage> {
  if (!tableName) {
    for (const tableName of Object.values(pageTableMap)) {
      const page = await getPageByName(pageName, tableName);
      if (page) {
        return page;
      }
    }
    return defaultPage as JsonPage;
  }
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('data, name')
      .eq('name', pageName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        throw new PageFetchError(
          `Page "${pageName}" not found in table "${tableName}"`,
          tableName,
          pageName,
          error
        );
      }
      
      throw new PageFetchError(
        `Failed to fetch page "${pageName}" from "${tableName}": ${error.message}`,
        tableName,
        pageName,
        error
      );
    }

    if (!data || !data.data) {
      throw new PageFetchError(
        `Page "${pageName}" found but has no data`,
        tableName,
        pageName
      );
    }

    return data.data as JsonPage;
  } catch (error) {
    if (error instanceof PageFetchError) {
      throw error;
    }

    throw new PageFetchError(
      `Unexpected error fetching page "${pageName}" from "${tableName}": ${error instanceof Error ? error.message : String(error)}`,
      tableName,
      pageName,
      error
    );
  }
}

/**
 * Fetches multiple pages from the specified table
 * 
 * @param tableName - The name of the table to query
 * @param pageNames - Array of page names to fetch
 * @returns Promise that resolves to a map of page names to JsonPage data
 * @throws PageFetchError if any page is not found or an error occurs
 * 
 * @example
 * ```typescript
 * const pages = await getPagesByName('rules_pages', ['combat-intro', 'armor-class']);
 * // Returns: { 'combat-intro': JsonPage, 'armor-class': JsonPage }
 * ```
 */
export async function getPagesByName(
  tableName: PageTableName,
  pageNames: string[]
): Promise<Record<string, JsonPage>> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('name, data')
      .in('name', pageNames);

    if (error) {
      throw new PageFetchError(
        `Failed to fetch pages from "${tableName}": ${error.message}`,
        tableName,
        pageNames.join(', '),
        error
      );
    }

    if (!data || data.length === 0) {
      throw new PageFetchError(
        `No pages found in table "${tableName}" for names: ${pageNames.join(', ')}`,
        tableName,
        pageNames.join(', ')
      );
    }

    const pagesMap: Record<string, JsonPage> = {};
    for (const row of data) {
      if (row.data) {
        pagesMap[row.name] = row.data as JsonPage;
      }
    }

    // Check if all pages were found
    const foundNames = Object.keys(pagesMap);
    const missingNames = pageNames.filter(name => !foundNames.includes(name));
    if (missingNames.length > 0) {
      throw new PageFetchError(
        `Some pages not found in table "${tableName}": ${missingNames.join(', ')}`,
        tableName,
        missingNames.join(', ')
      );
    }

    return pagesMap;
  } catch (error) {
    if (error instanceof PageFetchError) {
      throw error;
    }

    throw new PageFetchError(
      `Unexpected error fetching pages from "${tableName}": ${error instanceof Error ? error.message : String(error)}`,
      tableName,
      pageNames.join(', '),
      error
    );
  }
}

/**
 * Fetches all pages from the specified table
 * 
 * @param tableName - The name of the table to query
 * @returns Promise that resolves to an array of objects with name and data
 * 
 * @example
 * ```typescript
 * const allRulesPages = await getAllPages('rules_pages');
 * ```
 */
export async function getAllPages(
  tableName: PageTableName
): Promise<Array<{ name: string; data: JsonPage }>> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('name, data')
      .order('name');

    if (error) {
      throw new PageFetchError(
        `Failed to fetch all pages from "${tableName}": ${error.message}`,
        tableName,
        'all',
        error
      );
    }

    if (!data) {
      return [];
    }

    return data
      .filter(row => row.data !== null)
      .map(row => ({
        name: row.name,
        data: row.data as JsonPage,
      }));
  } catch (error) {
    if (error instanceof PageFetchError) {
      throw error;
    }

    throw new PageFetchError(
      `Unexpected error fetching all pages from "${tableName}": ${error instanceof Error ? error.message : String(error)}`,
      tableName,
      'all',
      error
    );
  }
}

/**
 * Fetches all page routes from all page tables
 * 
 * @returns Promise that resolves to a RouteSet object containing all page routes
 */
export async function getAllPageRoutes(): Promise<RouteSet> {
  const routes: RouteSet = { name: 'all', subsets: [], routes: [] };
  for (const topic of Object.keys(pageTableMap)) {
    const tableName = pageTableMap[topic as keyof typeof pageTableMap];
    const { data, error } = await supabase
      .from(tableName)
      .select('route, name');
    if (error) {
      throw new PageFetchError(
        `Failed to fetch all page routes from "${tableName}": ${error.message}`,
        tableName,
        'all',
        error
      );
    }
    if (!data) {
      continue;
    }

    const topicRouteSet: RouteSet = { name: topic, subsets: [], routes: [] };

    const topicRootPage = data.find(row => row.route === `/${topic}`);
    if (topicRootPage) {
      topicRouteSet.rootPage = parseRoute(topicRootPage.route) ?? undefined;
    }

    for (const row of data) {
      const route = parseRoute(row.route);
      if (!route) {
        continue;
      }
      if (route.subtopic) {
        // find or create subset
        const subset = topicRouteSet.subsets!.find(subset => subset.name === route.subtopic);
        if (subset) {
          // add to subset
          subset.routes.push(route);
        } else {
          // create subset
          const rootPage = topicRouteSet.routes.find(r => r.pageName === route.subtopic);
          if (rootPage) {
            // if root page was processed previously, remove it from routes
            topicRouteSet.routes = topicRouteSet.routes.filter(r => r.pageName !== rootPage.pageName);
          }
          topicRouteSet.subsets!.push({ name: route.subtopic, subsets: [], routes: [route], rootPage: rootPage ?? undefined });
        }
      } else {
        // check if page is a root page for an existing subset, or add to routes
        const subset = topicRouteSet.subsets!.find(subset => subset.name === route.pageName);
        if (subset) {
          subset.rootPage = route;
        } else {
          topicRouteSet.routes.push(route);
        }
      }
    }

    routes.subsets!.push(topicRouteSet);
  }
  return routes;
}