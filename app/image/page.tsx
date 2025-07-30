'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download, Image as ImageIcon, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  url: string;
  id: string;
}

interface GenerationResponse {
  requestId?: string;
  originalPrompt?: string;
  enhancedPrompt?: string;
  error?: string;
  success?: boolean;
}

export default function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aspectRatioOptions = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
  ];

  const modelOptions = [
    { value: 'fast', label: 'Fast', description: 'Quick generation with good quality (4 images)' },
    { value: 'pro', label: 'Pro', description: 'Balanced speed and quality (1 image)' },
    { value: 'ultra', label: 'Ultra', description: 'Highest quality generation (1 image)' },
  ];

  const getModelLabel = (value: string) => {
    const option = modelOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select a model';
  };

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
          model: selectedModel,
        }),
      });

      const data: GenerationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      // Store the enhanced prompt for display
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }
      
      if (data.requestId) {
        pollForResults(data.requestId);
      }

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

        console.log('Poll response:', data);

        if (data.status === 'succeeded' && data.output) {
          console.log('Generation succeeded, output length:', data.output.length);
          console.log('Output URLs:', data.output);
          
          const generatedImages = data.output.map((url: string, index: number) => ({
            url,
            id: `${id}-${index}`,
          }));
          
          console.log('Generated images array:', generatedImages);
          setImages(generatedImages);
          setIsGenerating(false);
          
          // Check expected image count based on model
          const expectedCount = selectedModel === 'fast' ? 4 : 1;
          
          if (generatedImages.length < expectedCount) {
            console.warn(`Expected ${expectedCount} images but got ${generatedImages.length}`);
            toast({
              title: "Partial Success",
              description: `Generated ${generatedImages.length} images (expected ${expectedCount}).`,
              variant: "default",
            });
          } else {
            toast({
              title: "Success",
              description: "Images generated successfully!",
            });
          }
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

  const copyEnhancedPrompt = async () => {
    if (!enhancedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopiedPrompt(true);
      toast({
        title: "Success",
        description: "Enhanced prompt copied to clipboard!",
      });
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-6 text-orange-600 font-serif">Generate Images</h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
          <Sparkles className="h-4 w-4 text-orange-600" />
          <p className="text-gray-700 text-sm font-medium">
            Transform your ideas into beautiful artwork
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="mb-8 border-orange-200 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Label htmlFor="prompt" className="text-orange-700 font-semibold text-lg">Image Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate... (e.g., 'A majestic dragon flying over a medieval castle at sunset')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-3 min-h-[100px] resize-none border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base"
                  disabled={isGenerating}
                  rows={3}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <Label htmlFor="aspect-ratio" className="text-orange-700 font-semibold text-lg">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                    <SelectTrigger className="mt-3 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl">
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

                <div>
                  <Label htmlFor="model" className="text-orange-700 font-semibold text-lg">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isGenerating}>
                    <SelectTrigger className="mt-3 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl">
                      <SelectValue>{getModelLabel(selectedModel)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Fast model generates 4 images. Pro and Ultra models generate 1 high-quality image.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >

                <Button
                  onClick={generateImages}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      <span className="flex items-center gap-2">
                        Generating Images
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ...
                        </motion.div>
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-3 h-6 w-6" />
                      Generate Images
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-orange-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Loader2 className="h-16 w-16 mx-auto text-orange-600" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-orange-700 mb-3"
                >
                  Generating your images...
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-600 text-lg"
                >
                  This may take a few minutes
                </motion.p>
                {enhancedPrompt && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-orange-700 font-medium">Enhanced Prompt:</p>
                      <Button
                        onClick={copyEnhancedPrompt}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-orange-100"
                      >
                        {copiedPrompt ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-orange-600" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 italic">&ldquo;{enhancedPrompt}&rdquo;</p>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full"
                >
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700 font-medium">AI is creating magic...</span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl font-bold mb-6 text-orange-600 font-serif text-center"
            >
              Generated Images
            </motion.h2>
            {enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <p className="text-sm text-orange-700 font-semibold">Enhanced Prompt Used:</p>
                    <Button
                      onClick={copyEnhancedPrompt}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-orange-200"
                    >
                      {copiedPrompt ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-orange-600" />
                      )}
                    </Button>
                  </div>
                  <p className="text-base text-gray-800 italic leading-relaxed">&ldquo;{enhancedPrompt}&rdquo;</p>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + (index * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Card className="overflow-hidden border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative">
                        <motion.img
                          src={image.url}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-auto rounded-2xl"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => downloadImage(image.url, index)}
                        />
                        <motion.div 
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center rounded-2xl"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          onClick={() => downloadImage(image.url, index)}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-black bg-opacity-50"
                          >
                            <Download className="h-5 w-5" />
                            Click to Download
                          </motion.div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}