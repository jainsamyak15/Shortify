"use server";

export interface VerificationResult {
  confidence_score: number;
  isVerified: boolean;
  matching_details: string[];
  discrepancies: string[];
}

export default async function Verify(title: string, description: string, source_url: string) {
  try {
    const response = await fetch("https://news-verifier-agent.onrender.com/verify-news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headline: title,
        description,
        source_url
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VerificationResult = await response.json();
    return Math.round(data.confidence_score * 100);
    
  } catch (error) {
    console.error("Verification failed:", error);
    return null; // Or handle error differently
  }
}