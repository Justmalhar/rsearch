"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Image, Loader2 } from "lucide-react";

interface ImageGenerationResult {
  url: string;
  alt: string;
}

const imageModels = [
  {
    id: "flux-pro",
    name: "Flux Pro",
    description: "High-quality image generation (single image only)",
    singleImage: true
  },
  {
    id: "flux-ultra", 
    name: "Flux Ultra",
    description: "Ultra-high quality image generation (single image only)",
    singleImage: true
  },
  {
    id: "flux-standard",
    name: "Flux Standard",
    description: "Standard quality image generation (multiple images supported)",
    singleImage: false
  }
];

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-standard');
  const [numOutputs, setNumOutputs] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ImageGenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const selectedModelConfig = imageModels.find(model => model.id === selectedModel);
      
      // Prepare request body - don't include num_outputs for single image models
      const requestBody: any = {
        prompt: prompt.trim(),
        model: selectedModel
      };

      // Only include num_outputs for models that support multiple images
      if (!selectedModelConfig?.singleImage) {
        requestBody.num_outputs = numOutputs;
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setResults(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedModelConfig = imageModels.find(model => model.id === selectedModel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">AI Image Generation</h1>
        <p className="text-orange-500/60">Create stunning images with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">Image Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[120px] resize-none"
                disabled={isGenerating}
              />
              
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Generated Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((result, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={result.url}
                        alt={result.alt}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <a
                        href={result.url}
                        download={`generated-image-${index + 1}.png`}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Button variant="secondary" size="sm">
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Section */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">Model Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedModel}
                onValueChange={setSelectedModel}
                className="space-y-3"
              >
                {imageModels.map((model) => (
                  <div key={model.id} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={model.id}
                      id={model.id}
                      className="mt-1 border-orange-500 text-orange-600"
                    />
                    <Label htmlFor={model.id} className="grid gap-1.5 leading-none cursor-pointer">
                      <div className="text-orange-600 font-medium">{model.name}</div>
                      <div className="text-sm text-orange-500/80">{model.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Number of Outputs - Only show for multi-image models */}
          {!selectedModelConfig?.singleImage && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Number of Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={numOutputs}
                    onChange={(e) => setNumOutputs(parseInt(e.target.value))}
                    className="flex-1"
                    disabled={isGenerating}
                  />
                  <span className="text-orange-600 font-medium min-w-[2rem] text-center">
                    {numOutputs}
                  </span>
                </div>
                <p className="text-sm text-orange-500/80 mt-2">
                  Generate {numOutputs} image{numOutputs > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info for single image models */}
          {selectedModelConfig?.singleImage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-blue-600 text-sm">
                  <strong>{selectedModelConfig.name}</strong> generates one high-quality image per request.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}