import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import { Article } from "../../../models/article";
import { removeRequestMeta } from "next/dist/server/request-meta";

connectMongoDB();

export async function POST(request) {
    try {
        const res = await request.json()
        const article = await Article.create(res);
        return Response.json({ article })
    } catch (error) {
        console.error('Error creating article:', error);
        return Response.error(error);
    }
}

export async function GET(request) {
    try {
        const articles = await Article.find({});
        return Response.json({ articles })
    } catch (error) {
        console.error('Error fetching articles:', error);
        return Response.error(error);
    }
}