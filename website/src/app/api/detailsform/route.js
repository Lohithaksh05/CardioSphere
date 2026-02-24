// api/detailsform/[...param].js
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectMongoDB();

  try {
    const data = await request.json();
    console.log(data);

    const { email, personalInfo, formData } = data;

    const user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          personalInfo: {
            ...personalInfo,
            data:data
          },
          
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "User Registered", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error saving user data" }, { status: 500 });
  }
}
