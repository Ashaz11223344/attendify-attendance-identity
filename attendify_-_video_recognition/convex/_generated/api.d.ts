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
import type * as attendance from "../attendance.js";
import type * as attendanceNotifications from "../attendanceNotifications.js";
import type * as auth from "../auth.js";
import type * as emailActions from "../emailActions.js";
import type * as emailService from "../emailService.js";
import type * as faceRecognition from "../faceRecognition.js";
import type * as http from "../http.js";
import type * as leaveRequests from "../leaveRequests.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as subjects from "../subjects.js";
import type * as userProfiles from "../userProfiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  attendanceNotifications: typeof attendanceNotifications;
  auth: typeof auth;
  emailActions: typeof emailActions;
  emailService: typeof emailService;
  faceRecognition: typeof faceRecognition;
  http: typeof http;
  leaveRequests: typeof leaveRequests;
  notifications: typeof notifications;
  reports: typeof reports;
  router: typeof router;
  subjects: typeof subjects;
  userProfiles: typeof userProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
