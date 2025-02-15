"use client";
import React, { useState, useEffect, useRef } from "react";
import TinderCard from "react-tinder-card";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

interface NewsItem {
  title: string;
  description: string;
  hasSeen: boolean;
  id?: string;
}

const categories = [
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "ai", label: "AI" },
  { id: "india", label: "India News" },
];

const fetchNewsFromDB = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`/api/db`);
    const data = await response.json();

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

        return newsData;
      } catch (error) {
        console.error("Error fetching news from API source:", error);
        return [];
      }
    }

    return data.news;
  } catch (error) {
    console.error("Error fetching news from database:", error);
    return [];
  }
};

export default function Page() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("technology");
  const [page, setPage] = useState(1);
  const tinderCardRefs = useRef<any[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { ref: infiniteScrollRef, inView } = useInView();

  useEffect(() => {
    const getNews = async () => {
      const allNews = await fetchNewsFromDB();
      setNewsList(allNews);
    };
    getNews();
  }, []);

  useEffect(() => {
    if (inView && isDesktop) {
      // Load more news when scrolling
      loadMoreNews();
    }
  }, [inView, isDesktop]);

  const loadMoreNews = async () => {
    // Implement pagination logic here
    setPage((prev) => prev + 1);
  };

  const onSwipe = async (direction: string, news: NewsItem) => {
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
      console.error("Error updating news:", error);
      return [];
    }
  };

  const MobileView = () => (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="relative w-full max-w-sm h-[70vh] flex justify-center items-center">
        {newsList.length > 0 ? (
          newsList.map((news, index) => (
            <TinderCard
              key={news.id || index}
              onSwipe={(dir) => onSwipe(dir, news)}
              preventSwipe={[]}
              className="absolute w-full h-full"
            >
              <Card className="w-full h-full overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-4">{news.title}</h2>
                    <p className="text-gray-600">{news.description}</p>
                  </div>
                  <div className="text-sm text-gray-500 mt-4">
                    Swipe right to save, left to dismiss
                  </div>
                </CardContent>
              </Card>
            </TinderCard>
          ))
        ) : (
          <p className="text-center text-lg">No more news available</p>
        )}
      </div>
    </div>
  );

  const DesktopView = () => (
    <div className="container mx-auto px-4 py-8">
      {/* Category Buttons */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? "bg-violet-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Headlines Carousel */}
      <div className="mb-12">
        <Carousel className="w-full">
          <CarouselContent>
            {newsList.slice(0, 5).map((news, index) => (
              <CarouselItem key={news.id || index}>
                <Card className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">{news.title}</h2>
                    <p className="text-lg">{news.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((news, index) => (
          <motion.div
            key={news.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">{news.title}</h3>
                <p className="text-gray-600">{news.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      
    </div>
  );

  return isDesktop ? <DesktopView /> : <MobileView />;
}