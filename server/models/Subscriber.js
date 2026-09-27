import mongoose from "mongoose";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => EMAIL_RE.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    source: {
      type: String,
      enum: ["hero", "newsletter-section", "footer"],
      default: "newsletter-section",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);
