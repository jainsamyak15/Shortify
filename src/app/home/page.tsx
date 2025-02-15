"use client";

import React, { useState, useEffect, useRef } from "react";

interface NewsItem {
  title: string;
  description: string;
}
import TinderCard from "react-tinder-card";
import axios from "axios";

const NEW_API = process.env.NEXT_PUBLIC_NEW_API;

const fetchNews = async () => {
  try {
    // here query param is us change that
    const response: any = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEW_API}`
    );

    console.log("response", response.data.articles[0])
    const news = response.data.articles || [];
    return news
      .filter((n: any) => n.title && n.description) // Ensure valid articles
      .map((n: any) => ({
        title: n.title,
        description: n.description,
      }));
  } catch (error) {
    console.error("Error fetching news:", error);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  }
};

export default function Page() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const tinderCardRefs = useRef<any[]>([]); // Refs for TinderCard instances

  useEffect(() => {
    const getNews = async () => {
      const news = await fetchNews();
      setNewsList(news);
    };
    getNews();
  }, []);

  const onSwipe = (direction: string, title: string) => {
    console.log(`Swiped ${direction} on: ${title}`);
    setNewsList((prev) => prev.filter((news) => news.title !== title));
  };

  const swipe = (dir: string) => {
    if (tinderCardRefs.current.length > 0) {
      const topCardRef = tinderCardRefs.current[newsList.length - 1];
      if (topCardRef && topCardRef.swipe) {
        topCardRef.swipe(dir); // Swipe the top card
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="relative w-80 h-96 flex justify-center items-center">
        {newsList.length > 0 ? (
          newsList.map((news, index) => (
            <TinderCard
              key={news.title}
              onSwipe={(dir) => onSwipe(dir, news.title)}
              preventSwipe={[]}
              className={`absolute w-full h-full shadow-lg rounded-lg bg-white flex justify-center items-center z-${newsList.length - index}`}
            >
              <div className="w-full h-full flex flex-col justify-center items-center p-4">
                <h2 className="text-xl font-bold">{news.title}</h2>
                <p className="text-sm text-gray-700 mt-2">{news.description}</p>
              </div>
            </TinderCard>
          ))
        ) : (
          <p className="text-center text-lg">No more news available!</p>
        )}
      </div>
    </div>
  );
}
