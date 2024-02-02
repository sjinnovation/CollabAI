import express from "express";
const categoryRouter = express.Router();
import { addCategory, updateCategory, getCategoryById, getAllActiveCategories, deleteCategory } from "../controllers/categoryController.js";

categoryRouter.route("/create/:userid").post(addCategory);

categoryRouter.route("/update/:category_id").put(updateCategory);

categoryRouter.route("/get/:category_id").get(getCategoryById);

categoryRouter.route("/getall").get(getAllActiveCategories);

categoryRouter.route("/delete/:category_id").delete(deleteCategory);

export default categoryRouter;
