import mongoose from "mongoose";
import Category from "../../models/category.js";
import Task from "../../models/task.js";
const postCategories = async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;
        
        const category = new Category({ name, userId });
        await category.save();

        return res.status(200).json({ "isSuccess": true, "message": "Category saved successfully", })
    } catch (error) {
        console.log("error",error)
        const err = new Error("Something went wrong")
        next(err)
    }

}
const getAllCategories = async (req, res,next) => {
    try {
        const userId = req.user._id;
        const filter = { userId: userId };
        const categories = await Category.find(filter);
        return res.status(200).json({ isSuccess: true, message: "Categoyr get successfully", data:categories });
    } catch (error) {
        const err = new Error("Something went wrong")
        next(err)
    }
};

const getAllCategoriesPagination = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.body;
        const userId = req.user._id;

        const matchStage = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        if (search.trim()) {
            matchStage.name = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const categoriesWithTaskCount = await Category.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "tasks", 
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "tasks"
                }
            },
            {
                $addFields: {
                    taskCount: { $size: "$tasks" }
                }
            },
            {
                $project: {
                    tasks: 0 
                }
            }
        ]);

        const total = await Category.countDocuments(matchStage);

        return res.status(200).json({
            isSuccess: true,
            message: "Categories fetched successfully",
            data: {
                data: categoriesWithTaskCount,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            },
        });

    } catch (error) {
        console.error(error);
        next(new Error("Something went wrong while fetching categories"));
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body

        const category = await Category.findOne({ _id: id, userId: req.user._id });

        if (!category) {
            return res.status(404).json({ isSuccess: false, message: "Category not found " });
        }
        const result = await Category.updateOne(
            { _id: id, userId: req.user._id },
            { $set: { name: name } }
        );
        if (result.nModified === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: "Category not found or no changes"
            });
        }

        return res.status(200).json({ isSuccess: true, message: "Category updated successfully", category });
    } catch (error) {
        const err = new Error("Something went wrong")
        next(err)
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await Category.deleteOne({ _id: id, userId: req.user._id });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            isSuccess: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        const err = new Error("Something went wrong")
        next(err)
    }
};

export {
    postCategories,
    getAllCategories,
    getAllCategoriesPagination,
    updateCategory,
    deleteCategory
}