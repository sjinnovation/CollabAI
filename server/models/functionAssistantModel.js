import mongoose, { Schema } from "mongoose";

const agentFunctionAssociationSchema = new Schema(
    {
        agentid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'assistant', 
          required: true,
        },
        functionid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FunctionDefinition', 
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now, 
        },
      },
      {
        timestamps: true,
      }
);

const AgentFunctionAssociation  = mongoose.model("AgentFunctionAssociation", agentFunctionAssociationSchema);
export default AgentFunctionAssociation ;