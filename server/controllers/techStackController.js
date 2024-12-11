import TechStack from "../models/tech_stack.js";

export const createTechStack = async (req, res) => {
    try {
        const stack = new TechStack(req.body);
        const savedStack = await stack.save();
        res.status(201).json(savedStack);
    } catch (err) {
        res.status(500).json({ message: "Error creating stack", err });
    }
};

export const getAllTechStack = async (req, res) => {
    try {
        const tech_stack = await TechStack.find();
        res.status(200).json(tech_stack);
    } catch (error) {
        res.status(500).json({ message: "Error getting tech stack", error });
    }
};

export const getTechStackById = async (req, res) => {
    try {
        const { id } = req.params;
        const techStack = await TechStack.findById(id);
        if (!techStack) {
            return res.status(404).json({ message: "Tech stack not found" });
        }
        res.status(200).json(techStack);
    } catch (error) {
        res.status(500).json({ message: "Error getting tech stack by ID", error });
    }
};
