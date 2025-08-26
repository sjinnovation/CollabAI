import mongoose from "mongoose";

const ServiceApiSchema = mongoose.Schema({
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'service_lists',
      required: true,
    },
    api_name: {
      type: String,
      required: true,
    },
    api_endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: true,
    },
    is_allowed: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: 'No description provided',
    },
    parameters: [
      {
        name: { type: String, required: true }, // The parameter name
        type: { type: String, required: true }, // The data type (e.g., string, number, boolean)
        required: { type: Boolean, default: false }, // Whether the parameter is required
        description: { type: String, default: '' }, // A description of the parameter
      },
    ],
  }, {
    timestamps: true,
  });
  
  const ServiceApi = mongoose.model('service_api', ServiceApiSchema);
  
export default ServiceApi;