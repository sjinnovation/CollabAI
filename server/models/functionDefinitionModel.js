import mongoose from "mongoose";

// Schema definition for a function
const FunctionDefinitionSchema = new mongoose.Schema(
  {
    title:{
      type: String,
      required: [true, "Please provide a function title"],
      trim: true,
      unique: true,
      maxlength: [100, "Function title cannot be more than 100 characters"], // Arbitrary max length
    },
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
    instruction: {
      type: String,
      required: [true, "Please provide a instruction for the function"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the function"],
    },
    parameters: {
      type: Object,
      required: [true, "Parameters are necessary for the function"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: false,
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
