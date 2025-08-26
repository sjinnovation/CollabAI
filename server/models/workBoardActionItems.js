import mongoose, { Schema } from "mongoose";

const WorkBoardAISchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        actionItems: {
            personal: [
                {
                    description: {
                        type: String,
                        required: true
                    },
                    url: {
                        type: String,
                        required: true
                    }
                }
            ],
            inLoop: [
                {
                    description: {
                        type: String,
                        required: true
                    },
                    url: {
                        type: String,
                        required: true
                    }
                }
            ]
        },
        workStreamList:[
            {
                wsTitle:{
                    type: String,
                    required :false
                }
            }
        ],
        wsBasedActionItems: [
            {
                wsTitle: {
                    type: String,
                    required: false,
                },
                wsId :{
                    type : Number,
                    required : false,
                }
                ,
                isSynced :{
                    type : Boolean,
                    required: false,
                    default : false,

                },
                actionItems: [
                    {
                        description: {
                            type: String,
                            required: true
                        },
                        url: {
                            type: String,
                            required: true
                        }
                    }
                ],
            }
        ],
        
    },
    {
        timestamps: true,
    },

);

const WorkBoardAI = mongoose.model("workBoardAI", WorkBoardAISchema);

export default WorkBoardAI;
