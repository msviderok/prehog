/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activeCall from "../activeCall.js";
import type * as callParticipants from "../callParticipants.js";
import type * as calls from "../calls.js";
import type * as chatMembers from "../chatMembers.js";
import type * as chats from "../chats.js";
import type * as clerk from "../clerk.js";
import type * as floatingPanels from "../floatingPanels.js";
import type * as gameState from "../gameState.js";
import type * as heartbeats from "../heartbeats.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as model_calls from "../model/calls.js";
import type * as model_chats from "../model/chats.js";
import type * as model_floatingPanels from "../model/floatingPanels.js";
import type * as model_users from "../model/users.js";
import type * as presence from "../presence.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activeCall: typeof activeCall;
  callParticipants: typeof callParticipants;
  calls: typeof calls;
  chatMembers: typeof chatMembers;
  chats: typeof chats;
  clerk: typeof clerk;
  floatingPanels: typeof floatingPanels;
  gameState: typeof gameState;
  heartbeats: typeof heartbeats;
  helpers: typeof helpers;
  http: typeof http;
  "model/calls": typeof model_calls;
  "model/chats": typeof model_chats;
  "model/floatingPanels": typeof model_floatingPanels;
  "model/users": typeof model_users;
  presence: typeof presence;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  crons: import("@convex-dev/crons/_generated/component.js").ComponentApi<"crons">;
};
