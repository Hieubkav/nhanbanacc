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
import type * as categories from "../categories.js";
import type * as customers from "../customers.js";
import type * as faqs from "../faqs.js";
import type * as healthCheck from "../healthCheck.js";
import type * as hello from "../hello.js";
import type * as images from "../images.js";
import type * as lib_crud from "../lib/crud.js";
import type * as post_images from "../post_images.js";
import type * as posts from "../posts.js";
import type * as privateData from "../privateData.js";
import type * as product_images from "../product_images.js";
import type * as product_variants from "../product_variants.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as service_website_images from "../service_website_images.js";
import type * as service_websites from "../service_websites.js";
import type * as settings from "../settings.js";
import type * as sliders from "../sliders.js";
import type * as student from "../student.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  customers: typeof customers;
  faqs: typeof faqs;
  healthCheck: typeof healthCheck;
  hello: typeof hello;
  images: typeof images;
  "lib/crud": typeof lib_crud;
  post_images: typeof post_images;
  posts: typeof posts;
  privateData: typeof privateData;
  product_images: typeof product_images;
  product_variants: typeof product_variants;
  products: typeof products;
  reviews: typeof reviews;
  service_website_images: typeof service_website_images;
  service_websites: typeof service_websites;
  settings: typeof settings;
  sliders: typeof sliders;
  student: typeof student;
  todos: typeof todos;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
