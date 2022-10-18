import { Router } from "express";

const router = Router();

// API | AUTH
// router.post(
//   "/api/auth/register",
//   (await import("./controllers/api/auth/register.js")).default
// );

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
