import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subjects: {
    type: [String],
    default: []
  }
});

const cohortSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    classes: {
      type: [classSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Unique combination of Cohort name and organizationId
cohortSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default mongoose.model("Cohort", cohortSchema);
