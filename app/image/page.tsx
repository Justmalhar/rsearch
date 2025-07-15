'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  url: string;
  id: string;
}

export default function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const aspectRatioOptions = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
  ];

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setImages([]);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      pollForResults(data.requestId);

    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const pollForResults = async (id: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/image?id=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check status');
        }

        if (data.status === 'succeeded' && data.output) {
          const generatedImages = data.output.map((url: string, index: number) => ({
            url,
            id: `${id}-${index}`,
          }));
          setImages(generatedImages);
          setIsGenerating(false);
          toast({
            title: "Success",
            description: "Images generated successfully!",
          });
          return;
        } else if (data.status === 'failed') {
          throw new Error('Image generation failed');
        } else if (attempts >= maxAttempts) {
          throw new Error('Generation timed out');
        }

        attempts++;
        setTimeout(poll, 5000); // Poll every 5 seconds

      } catch (error) {
        console.error('Error polling for results:', error);
        toast({
          title: "Error",
          description: "Failed to get generation results",
          variant: "destructive",
        });
        setIsGenerating(false);
      }
    };

    poll();
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rSearch-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: `Image ${index + 1} downloaded successfully!`,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-orange-600">AI Image Generator</h1>
        <p className="text-gray-600 text-lg">
          Create stunning images with AI using natural language prompts
        </p>
      </div>

      <Card className="mb-8 border-orange-200 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="text-orange-700 font-semibold">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate... (e.g., 'A majestic dragon flying over a medieval castle at sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 min-h-[80px] resize-none border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                disabled={isGenerating}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="aspect-ratio" className="text-orange-700 font-semibold">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                <SelectTrigger className="mt-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateImages}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Generate Images
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card className="mb-8 border-orange-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-xl font-semibold text-orange-700 mb-2">Generating your images...</p>
            <p className="text-gray-600">This may take a few minutes</p>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8 text-orange-600">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {images.map((image, index) => (
              <Card key={image.id} className="overflow-hidden border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative group">
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-auto rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <Button
                        onClick={() => downloadImage(image.url, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Image {index + 1}</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        {aspectRatio}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}