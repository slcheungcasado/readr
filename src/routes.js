import { Router } from "express";

const router = Router();

// PAGES |
router.get(
  "/my/subscriptions/devto",
  (await import("./controllers/pages/my/subscriptions/devto/index.js")).default
);

// PAGES | STATIC
router.get(
  "/",
  (await import("./controllers/pages/my/reading-list/index.js")).default
);

// PAGES | NOT FOUND
router.use((await import("./controllers/pages/not-found.js")).default);

export default router;
