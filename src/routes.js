import { Router } from "express";

import { checkData } from "./_middlewares/check-data.js";
import authenticateUser from "./_middlewares/authenticate-user.js";
import alreadyLoggedIn from "./_middlewares/already-logged-in.js";
import checkOwnership from "./_middlewares/_check_ownership.js";

import loginSchema from "./schemas/login.js";
import registrationSchema from "./schemas/registration.js";
import updateProfile from "./schemas/update-profile.js";
import addToReadingList from "./schemas/add-to-reading-list.js";
import removeFromReadingList from "./schemas/remove-from-reading-list.js";
import indexMatchingTags from "./schemas/index-matching-tags.js";
import editTagsSchema from "./schemas/update-own-article-tags.js";

const router = Router();

// API | AUTH
router.post(
  "/api/auth/register",
  checkData(registrationSchema),
  (await import("./controllers/api/auth/register.js")).default
);

router.post(
  "/api/auth/login",
  checkData(loginSchema),
  (await import("./controllers/api/auth/login.js")).default
);

router.delete(
  "/api/auth/logout",
  (await import("./controllers/api/auth/logout.js")).default
);

// API | MY PROFILE | AUTH REQUIRED
router.get(
  "/api/my/profile",
  authenticateUser("json"),
  (await import("./controllers/api/my/profile/show.js")).default
);

router.put(
  "/api/my/profile",
  authenticateUser("json"),
  checkData(updateProfile),
  (await import("./controllers/api/my/profile/update.js")).default
);

// API | MY ARTICLES | AUTH REQUIRED
router.get(
  "/api/my/reading-list/articles/:id",
  authenticateUser("json"),
  (await import("./controllers/api/my/reading-list/articles/show.js")).default
);

router.get(
  "/api/my/reading-list",
  authenticateUser("json"),
  (await import("./controllers/api/my/reading-list/articles/index.js")).default
);

router.post(
  "/api/my/reading-list/articles",
  authenticateUser("json"),
  checkData(addToReadingList),
  (await import("./controllers/api/my/reading-list/articles/create.js")).default
);

router.post(
  "/api/my/reading-list/articles/tags",
  authenticateUser("json"),
  checkData(indexMatchingTags),
  (await import("./controllers/api/my/reading-list/articles/tags/index.js"))
    .default
);

router.put(
  "/api/my/reading-list/articles/tags",
  authenticateUser("json"),
  checkData(editTagsSchema),
  (await import("./controllers/api/my/reading-list/articles/tags/update.js"))
    .default
);

router.delete(
  "/api/my/reading-list/articles",
  authenticateUser("json"),
  checkData(removeFromReadingList),
  checkOwnership,
  (await import("./controllers/api/my/reading-list/articles/destroy.js"))
    .default
);

// API | ARTICLES
router.get(
  "/api/articles",
  (await import("./controllers/api/articles/index.js")).default
);

router.get(
  "/api/articles/:topic",
  (await import("./controllers/api/articles/show.js")).default
);

// API | NOT FOUND
router.use("/api", (await import("./controllers/api/not-found.js")).default);

// PAGES | AUTH
router.get(
  "/auth/register",
  alreadyLoggedIn("html"),
  (await import("./controllers/pages/auth/register.js")).default
);

router.get(
  "/auth/login",
  alreadyLoggedIn("html"),
  (await import("./controllers/pages/auth/login.js")).default
);

// PAGES | MY PROFILE | AUTH REQUIRED
router.get(
  "/my/profile",
  authenticateUser("html"),
  (await import("./controllers/pages/my/profile/update.js")).default
);

// PAGES | MY ARTICLES | AUTH REQUIRED
router.get(
  "/my/reading-list",
  authenticateUser("html"),
  (await import("./controllers/pages/my/reading-list/articles/index.js"))
    .default
);

router.get(
  "/my/reading-list/articles/:id",
  authenticateUser("html"),
  (await import("./controllers/pages/my/reading-list/articles/show.js")).default
);

// PAGES | ARTICLES
router.get(
  "/articles",
  (await import("./controllers/pages/articles/index.js")).default
);

// PAGES | STATIC
router.get(
  "/",
  (await import("./controllers/pages/articles/index.js")).default
);

// PAGES | NOT FOUND
router.use((await import("./controllers/pages/not-found.js")).default);

export default router;
