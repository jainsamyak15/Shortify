import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEW_API;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "us"; // Default to 'us'

    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`);

    const news = (response.data as { articles: any[] }).articles || [];
    
    const processedNews = news.map((n: any) => ({
      title: n.title,
      description: n.description,
      hasSeen: false, // Default to false
    }));

    return NextResponse.json(processedNews, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { country } = body; // Get country from POST request

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 });
    }

    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`
    );

    const news = (response.data as { articles: any[] }).articles || [];
    const processedNews = news.map((n: any) => ({
      title: n.title,
      description: n.description,
      hasSeen: false, // Default to false
    }));

    return NextResponse.json(processedNews, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
