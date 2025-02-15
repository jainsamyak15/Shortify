"use client";

import React, { useState, useEffect, useRef } from "react";
import TinderCard from "react-tinder-card";

interface NewsItem {
  title: string;
  description: string;
  hasSeen: boolean;
}

const fetchNewsFromDB = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`/api/db`);
    const data = await response.json(); // Extract the response JSON

    if (!data.news) {
      console.error("Invalid response from /api/db", data);
      return [];
    }

    if (data.count === 0) {
      try {
        const newsResponse = await fetch(`/api/news`);
        const newsData = await newsResponse.json();

        if (!newsData || !Array.isArray(newsData)) {
          console.error("Invalid response from /api/news", newsData);
          return [];
        }

        console.log("Fetched from /api/news", newsData);
        return newsData; // Assuming /api/news directly returns an array
      } catch (error) {
        console.error("Error fetching news from API source:", error);
        return [];
      }
    }

    return data.news; // Extract and return only the news array
  } catch (error) {
    console.error("Error fetching news from database:", error);
    return [];
  }
};



export default function Page() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const tinderCardRefs = useRef<any[]>([]); // Refs for TinderCard instances

  useEffect(() => {
    const getNews = async () => {
      const allNews = await fetchNewsFromDB();
      setNewsList(allNews); // Fix: Remove extra dot (allNews.)
    };
    getNews();
  }, []);

  const onSwipe = async (direction: string, title: string, news: any) => {
    console.log("news", news.id);
    try {
      const response = await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hasSeen: true, id: news.id }),
      });

      return response.json();
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }

    // console.log(`Swiped ${direction} on: ${title}`);
    // setNewsList((prev) =>
    //   prev.map((news) =>
    //     news.title === title ? { ...news, hasSeen: true } : news
    //   )
    // );
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
              onSwipe={(dir) => onSwipe(dir, news.title, news)}
              preventSwipe={[]}
              className={`absolute w-full h-full shadow-lg rounded-lg bg-white flex justify-center items-center z-${
                newsList.length - index
              }`}
            >
              <div className="w-full h-full flex flex-col justify-center items-center p-4">
                <h2 className="text-xl font-bold">{news.title}</h2>
                <p className="text-sm text-gray-700 mt-2">{news.description}</p>
              </div>
            </TinderCard>
          ))
        ) : (
          <p className="text-center text-lg">No more unseen news!</p>
        )}
      </div>
    </div>
  );
}
