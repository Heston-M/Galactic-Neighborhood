import { pageTableMap, ReactNodePage } from "@/types/page";
import { Route, RouteSet } from "@/types/route";
import { Topic } from "@/types/topic";

/**
 * Find the topic of a route set
 * @param subset - The route set to find the topic of
 * @returns The topic of the route set
 */
export const findTopic = (subset: RouteSet): Topic => {
  if (subset.subsets && subset.subsets.length > 0) {
    return findTopic(subset.subsets[0]);
  } else {
    return subset.routes[0].topic;
  }
}

/**
 * Parse a route string into a Route object
 * @param route - The route string to parse
 * @returns The Route object
 */
export const parseRoute = (route: string) => {
  // remove leading and trailing slashes
  route = route.replace(/^\/+|\/+$/g, '');
  // split route into parts
  const routeParts = route.split('/');
  const length = routeParts.length;
  if (length === 0) {
    return null;
  }
  // get topic, subtopic (if any), and page name
  const topic = routeParts[0] as Topic;
  const subtopic = length > 2 ? routeParts[1] : undefined;
  const pageName = length > 2 ? routeParts[2] : routeParts[1];

  const parsedRoute: Route = { topic, subtopic, pageName };
  if (!isValidRoute(parsedRoute)) {
    return null;
  }
  return parsedRoute;
}

export const parseRouteFromPage = (page: ReactNodePage) => {
  const parsedRoute: Route = { topic: page.topic, pageName: page.title };
  if (!isValidRoute(parsedRoute)) {
    return null;
  }
  return parsedRoute;
}

/**
 * Parse an array of route strings into an array of Route objects
 * @param routes - The array of route strings to parse
 * @returns The array of Route objects
 */
export const parseRoutes = (routes: string[]) => {
  return routes.map((route) => parseRoute(route));
}

/**
 * Check if a route string is valid
 * @param route - The route string to check
 * @returns True if the route is valid, false otherwise
 */
export const isValidRoute = (route: string | Route) => {
  const parsedRoute = typeof route === 'string' ? parseRoute(route) : route;
  if (!parsedRoute) {
    return false;
  }
  const tableName = pageTableMap[parsedRoute.topic];
  if (!tableName) {
    return false;
  }
  return true;
}

export const constructRoute = (route: Route) => {
  return `/${route.topic}${route.subtopic ? `/${route.subtopic}` : ''}${route.pageName}`;
}