/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as deadlines from "../deadlines.js";
import type * as middleware from "../middleware.js";
import type * as processes from "../processes.js";
import type * as seed from "../seed.js";
import type * as tribunals from "../tribunals.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  auth: typeof auth;
  clients: typeof clients;
  deadlines: typeof deadlines;
  middleware: typeof middleware;
  processes: typeof processes;
  seed: typeof seed;
  tribunals: typeof tribunals;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
