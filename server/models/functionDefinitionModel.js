import mongoose from "mongoose";

// Schema definition for a function
const FunctionDefinitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a function name"],
      trim: true, // Trim whitespace from the beginning and end
      unique: true, // Ensure function names are unique
      maxlength: [100, "Function name cannot be more than 100 characters"], // Arbitrary max length
    },
    definition: {
      type: String,
      required: [true, "Please provide a function definition"],
      trim: true,
      minlength: [1, "Function definition cannot be empty"], // Definition must contain at least 1 character
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the function"],
    },
    purpose: {
      type: String,
      required: [true, "Please provide a purpose for the function"],
    },
    parameters: {
      type: Object,
      required: [true, "Parameters are necessary for the function"],
    },
  },
  {
    timestamps: true,
  }
);

// Compile the schema into a model
const FunctionDefinition = mongoose.model(
  "FunctionDefinition",
  FunctionDefinitionSchema
);

export default FunctionDefinition;
