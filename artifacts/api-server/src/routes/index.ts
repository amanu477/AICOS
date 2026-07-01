import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shopifyRouter from "./shopify";
import productsRouter from "./products";
import collectionsRouter from "./collections";
import novaRouter from "./nova";
import discoveryRouter from "./discovery";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/shopify", shopifyRouter);
router.use(productsRouter);
router.use(collectionsRouter);
router.use("/nova", novaRouter);
router.use("/discovery", discoveryRouter);

export default router;
