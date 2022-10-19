import { Router } from "express";
import { checkData } from "./_middlewares/check-data.js";
import registrationSchema from "./schemas/registration.js";
import loginSchema from "./schemas/login.js";
import authenticateUser from "./_middlewares/authenticate-user.js";
import updateProfile from "./schemas/update-profile.js";
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

// API | ARTICLES
//index (also search/filter/pagination)
router.get(
  "/api/articles",
  (await import("./controllers/api/articles/index.js")).default
);

//show
// router.get(
//   "/api/articles/:id",
//   (await import("./controllers/api/articles/show.js")).default
// );
// API | NOT FOUND
router.use("/api", (await import("./controllers/api/not-found.js")).default);

// PAGES | AUTH
router.get(
  "/auth/register",
  (await import("./controllers/pages/auth/register.js")).default
);

router.get(
  "/auth/login",
  (await import("./controllers/pages/auth/login.js")).default
);

// PAGES | MY PROFILE | AUTH REQUIRED

router.get(
  "/my/profile",
  authenticateUser("html"),
  (await import("./controllers/pages/my/profile/update.js")).default
);

// PAGES | ARTICLES
router.get(
  "/articles",
  (await import("./controllers/pages/articles/index.js")).default
);

// router.get(
//   "/articles/:id",
//   (await import("./controllers/pages/articles/show.js")).default
// );

// PAGES | STATIC
router.get(
  "/",
  (await import("./controllers/pages/articles/index.js")).default
);

// PAGES | NOT FOUND
router.use((await import("./controllers/pages/not-found.js")).default);

export default router;
