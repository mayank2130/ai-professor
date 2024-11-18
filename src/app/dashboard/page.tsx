'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ArrowRight, Book, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const RoadmapDashboard = () => {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = () => {
    try {
      const savedRoadmaps = localStorage.getItem('roadmaps');
      if (savedRoadmaps) {
        const parsedRoadmaps: Roadmap[] = JSON.parse(savedRoadmaps);
        // Sort roadmaps by creation date (newest first)
        parsedRoadmaps.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRoadmaps(parsedRoadmaps);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setError('Failed to load saved roadmaps');
    }
  };

  const deleteRoadmap = (title: string) => {
    try {
      const updatedRoadmaps = roadmaps.filter(roadmap => roadmap.title !== title);
      localStorage.setItem('roadmaps', JSON.stringify(updatedRoadmaps));
      setRoadmaps(updatedRoadmaps);
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      setError('Failed to delete roadmap');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateToRoadmap = (title: string) => {
    router.push(`/roadmap/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Your Learning Roadmaps</h1>
            <p className="text-lg text-gray-600 mt-2">
              Track your progress across different learning paths
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            Create New Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {roadmaps.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Book className="h-12 w-12 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700">No roadmaps yet</h3>
                <p className="text-gray-500">
                  Create your first learning roadmap to get started
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="mt-4"
                >
                  Create Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap, index) => (
              <Card 
                key={index}
                className="transform transition-all hover:scale-[1.02]"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(roadmap.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ListChecks className="h-4 w-4" />
                      <span>{roadmap.steps.length} Learning Steps</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Book className="h-4 w-4" />
                      <span>{roadmap.questions.length} Practice Questions</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => deleteRoadmap(roadmap.title)}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => navigateToRoadmap(roadmap.title)}
                  >
                    View Roadmap
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDashboard;