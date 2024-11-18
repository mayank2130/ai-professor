'use client'

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

const RoadmapGenerator = () => {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const generateRoadmap = async () => {
    setLoading(true);
    setError(null);
    setRoadmapTitle(topic);
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.1:8b",
          prompt: `Create a learning roadmap for ${topic} with exactly 5 steps. Each step should have a title and description. Format the response exactly like this, with no additional text:

Step 1: [title]
Description: [description]
Step 2: [title]
Description: [description]
Step 3: [title]
Description: [description]
Step 4: [title]
Description: [description]
Step 5: [title]
Description: [description]`,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Ollama');
      }

      const result = await response.json();
      const generatedText = result.response;
      
      const parsedSteps = parseStepsFromResponse(generatedText);
      
      if (parsedSteps.length > 0) {
        setRoadmap(parsedSteps);
        // Generate questions after roadmap is created
        await generateQuestions(parsedSteps);
      } else {
        setError('Failed to parse the response. Please try again.');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setError('Failed to generate roadmap. Make sure Ollama is running on WSL and accessible.');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async (steps: RoadmapStep[]) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.1:8b",
          prompt: `Generate 5 multiple choice questions based on these learning steps:
${steps.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`).join('\n')}

Format each question exactly like this, with no additional text:

Q1: [question]
A) [option1]
B) [option2]
C) [option3]
D) [option4]
Correct: [A/B/C/D]

Q2: [question]
...and so on for all 5 questions.`,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const result = await response.json();
      const parsedQuestions = parseQuestionsFromResponse(result.response);
      
      if (parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
      } else {
        setError('Failed to parse questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please try again.');
    }
  };

  const parseQuestionsFromResponse = (response: string): MCQQuestion[] => {
    const questions: MCQQuestion[] = [];
    const questionRegex = /Q\d+:\s*([^\n]+)\nA\)\s*([^\n]+)\nB\)\s*([^\n]+)\nC\)\s*([^\n]+)\nD\)\s*([^\n]+)\nCorrect:\s*([ABCD])/g;
    
    let match;
    while ((match = questionRegex.exec(response)) !== null) {
      const [_, question, optionA, optionB, optionC, optionD, correct] = match;
      questions.push({
        question: question.trim(),
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        correctAnswer: correct.trim()
      });
    }

    return questions;
  };

  const parseStepsFromResponse = (response: string): RoadmapStep[] => {
    const steps: RoadmapStep[] = [];
    const stepRegex = /Step \d+:\s*([^\n]+)\s*Description:\s*([^\n]+)/g;
    
    let match;
    while ((match = stepRegex.exec(response)) !== null) {
      steps.push({
        title: match[1].trim(),
        description: match[2].trim()
      });
    }

    return steps;
  };

  const saveRoadmap = async () => {
    if (!roadmapTitle || roadmap.length === 0) return;

    const newRoadmap: Roadmap = {
      title: roadmapTitle,
      steps: roadmap,
      questions: questions,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingRoadmaps = JSON.parse(localStorage.getItem('roadmaps') || '[]');
    localStorage.setItem('roadmaps', JSON.stringify([...existingRoadmaps, newRoadmap]));
    
    setSaved(true);
    // Navigate to the dynamic route
    router.push(`/roadmap/${encodeURIComponent(roadmapTitle.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Learning Roadmap Generator</h1>
          <p className="text-lg text-gray-600">
            Enter a topic you want to learn, and we'll create a personalized roadmap with practice questions
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter a topic (e.g., 'Machine Learning', 'Web Development')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={generateRoadmap}
            disabled={loading || !topic}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              'Generate Roadmap'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {roadmap.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Enter roadmap title"
                value={roadmapTitle}
                onChange={(e) => setRoadmapTitle(e.target.value)}
                className="max-w-md"
              />
              <Button
                onClick={saveRoadmap}
                disabled={!roadmapTitle || saved}
                className="ml-4"
              >
                {saved ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  'Save Roadmap'
                )}
              </Button>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />

              {/* Timeline items */}
              <div className="space-y-8">
                {roadmap.map((step, index) => (
                  <div key={index} className="relative pl-12">
                    {/* Timeline dot */}
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
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Questions Section */}
            {questions.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Practice Questions</h2>
                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 font-medium">{q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border ${
                                String.fromCharCode(65 + optIndex) === q.correctAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200'
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
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;