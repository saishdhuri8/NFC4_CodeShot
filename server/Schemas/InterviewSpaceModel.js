
import mongoose from "mongoose";

const { Schema } = mongoose;

const DSASubmissionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

    testCases: [
      {
        input: { type: String },
      }
    ],
    externalId: { type: String },
  },
  { _id: false }
);

const InterviewSpaceSchema = new Schema(
  {
    
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    
    invitedInterviewers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },//this will come from DB 
        email:{
          type:String
        }
      }
    ],


    dsaQuestions: [DSASubmissionSchema],

    title: { type: String, default: "Interview Session" },
    scheduledAt: { type: Date },



    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    candidateEmail: {//this will come from DB
      type: String
    },




    videoRoomId: { type: String },
    codeRoomId: { type: String },
    whiteBoardRoom: { type: String },


  },
  { timestamps: true }
);



const InterviewSpace = mongoose.models.InterviewSpace || mongoose.model("InterviewSpace", InterviewSpaceSchema);
export default InterviewSpace;
