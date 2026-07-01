import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shopifyRouter from "./shopify";
import productsRouter from "./products";
import collectionsRouter from "./collections";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/shopify", shopifyRouter);
router.use(productsRouter);
router.use(collectionsRouter);

export default router;
