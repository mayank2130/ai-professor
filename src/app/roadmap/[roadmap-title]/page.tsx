"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RoadmapStep {
  title: string;
  description: string;
}

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Roadmap {
  title: string;
  steps: RoadmapStep[];
  questions: MCQQuestion[];
  createdAt: string;
}

const RoadmapPage = () => {
  const params = useParams();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoadmap = () => {
      try {
        const roadmapTitle = params["roadmap-title"];
        if (!roadmapTitle) {
          setIsLoading(false);
          return;
        }

        const roadmaps: Roadmap[] = JSON.parse(
          localStorage.getItem("roadmaps") || "[]"
        );
        const currentRoadmap = roadmaps.find(
          (r: Roadmap) =>
            r.title.toLowerCase().replace(/\s+/g, "-") === roadmapTitle
        );

        if (currentRoadmap) {
          setRoadmap(currentRoadmap);
        }
      } catch (error) {
        console.error("Error loading roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoadmap();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p>Loading roadmap...</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Roadmap not found
            </h1>
            <Link href="/">
              <Button>Back to Generator</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {roadmap.title}
            </h1>
            <p className="text-gray-600 mt-2">
              Created on {new Date(roadmap.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Back to Generator</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />

          <div className="space-y-8">
            {roadmap.steps.map((step, index) => (
              <div key={index} className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 bg-blue-100 rounded-full border-4 border-blue-200 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </div>

                <Card className="transform transition-all hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                  <div className="flex justify-end pr-4 pb-2">
                    <Button className="">
                      <Play height={10} width={10} />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        {roadmap.questions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Practice Questions</h2>
            <div className="space-y-6">
              {roadmap.questions.map((q, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 font-medium">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            String.fromCharCode(65 + optIndex) ===
                            q.correctAnswer
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}) {option}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;
