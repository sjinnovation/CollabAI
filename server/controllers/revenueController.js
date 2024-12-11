import Revenue from "../models/RevenueModel.js";
import Project from "../models/Project.js"; // Assuming you have a model for projects

// Get all revenue data for all clients (without aggregation)
export const getAllRevenueData = async (req, res) => {
  try {
    // Step 1: Fetch all revenue data
    const revenues = await Revenue.find();

    if (!revenues || revenues.length === 0) {
      return res.status(404).json({ 
        message: "No revenue data found" 
      });
    }

    // Step 2: Return all revenue data as an array
    res.status(200).json({ 
      revenues 
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ 
      message: "Error fetching revenue data", 
      error: error.message 
    });
  }
};
