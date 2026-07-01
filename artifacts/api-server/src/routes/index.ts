import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shopifyRouter from "./shopify";
import productsRouter from "./products";
import collectionsRouter from "./collections";
import novaRouter from "./nova";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/shopify", shopifyRouter);
router.use(productsRouter);
router.use(collectionsRouter);
router.use("/nova", novaRouter);

export default router;
