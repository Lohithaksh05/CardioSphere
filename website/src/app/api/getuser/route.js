import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import { NextResponse } from "next/server";

connectMongoDB();

export async function POST(request) {
    try {
        const data = await request.json();

        // Find user by email posted in the request
        const user = await User.findOne({ email: data.email });

        if (!user) {
            // Handle the case where the user is not found
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Extract relevant user data
        

        // Return the user data in the response
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        // Handle any errors and return an error response
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
