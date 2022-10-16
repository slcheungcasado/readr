import { Router } from "express";

const router = Router();

// PAGES | STATIC
router.get(
  "/",
  (await import("./controllers/pages/subscriptions/index.js")).default
);

// PAGES | NOT FOUND
router.use((await import("./controllers/pages/not-found.js")).default);

export default router;
