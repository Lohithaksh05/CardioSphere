import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: String,
    personalInfo: {
      type: Schema.Types.Mixed,
      default: {},
    },
    formData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;


// import mongoose, { Schema, models } from "mongoose";

// const userSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },

//     phno: {
//       type: String,
//       required: true,
//     },

//     email: {
//       type: String,
//       required: true,
//     },

//     gender : {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const User = models.User || mongoose.model("User", userSchema);
// export default User;