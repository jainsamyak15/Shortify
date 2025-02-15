"use client";
import { useState } from "react";
import Verify from "@/actions/verify";
import SubNews from "@/actions/submit";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function PostNews() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const handleVerification = async () => {
    setError("");

    if (!title.trim() || !description.trim() || !source.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const result = await Verify(title, description, source);
      console.log(result);

      if (result === null) {
        setError("Verification failed. Please try again.");
        return;
      }

      const constructedJson = {
        title: title,
        description: description,
        source: source,
        confidence_score: Math.round(result.confidence_score * 100),
        isVerified: result.isVerified,
        matching_details: result.matching_details,
        discrepancies: result.discrepancies,
      };

      console.log("Constructed JSON:", constructedJson);

      setScore(constructedJson.confidence_score);
    } catch (err) {
      setError("Error during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    if (!score || score < 70) {
      setError("Please verify first.");
      return;
    }

    try {
      const submissionId = await SubNews(title, description, score);
      setId(submissionId);
      setError("");
    } catch (err) {
      setError("Submission failed.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post News</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="url"
          placeholder="Enter valid source URL"
          className="w-full p-2 border rounded"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />

        {error && <p className="text-red-500">{error}</p>}

        <RainbowButton
          onClick={handleVerification}
          disabled={
            loading || !title.trim() || !description.trim() || !source.trim()
          }
        >
          {loading ? "Verifying..." : "Verify News"}
        </RainbowButton>

        {score !== null && (
          <div className="mt-4">
            <p className="font-semibold">
              Confidence Score: {score}%{" "}
              <span className={score >= 70 ? "text-green-500" : "text-red-500"}>
                ({score >= 70 ? "Verified" : "Not Verified"})
              </span>
            </p>
          </div>
        )}

        <RainbowButton
          onClick={handleSubmission}
          disabled={!score || score < 70}
          className="mt-4"
        >
          Submit News
        </RainbowButton>

        {id && <p className="mt-4 text-green-500">Submission ID: {id}</p>}
      </div>
    </div>
  );
}
