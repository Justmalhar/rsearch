'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download, Image as ImageIcon, Sparkles, Copy, Check, Wand2, Palette, Zap } from 'lucide-react';
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
    { value: '1:1', label: 'Square', icon: '⬜' },
    { value: '16:9', label: 'Landscape', icon: '⬜' },
    { value: '9:16', label: 'Portrait', icon: '⬜' },
  ];

  const modelOptions = [
    { value: 'fast', label: 'Fast', description: 'Quick generation', icon: Zap },
    { value: 'pro', label: 'Pro', description: 'Balanced quality', icon: Palette },
    { value: 'ultra', label: 'Ultra', description: 'Highest quality', icon: Wand2 },
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
          console.log('Generation succeeded, output type:', typeof data.output);
          console.log('Output URLs:', data.output);
          
          // Handle both single URL (Pro/Ultra) and array of URLs (Fast)
          const outputArray = Array.isArray(data.output) ? data.output : [data.output];
          console.log('Output array length:', outputArray.length);
          
          const generatedImages = outputArray.map((url: string, index: number) => ({
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 py-12 max-w-5xl"
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-8 shadow-2xl">
            <ImageIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent tracking-tight">
            Image Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into stunning artwork with AI-powered image generation
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-12">
              <div className="space-y-8">
                {/* Prompt Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Label htmlFor="prompt" className="text-lg font-semibold text-gray-800 mb-4 block">
                    Describe your vision
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="A majestic dragon soaring over a medieval castle at golden hour, cinematic lighting, detailed scales..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-2xl text-lg p-6 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    disabled={isGenerating}
                    rows={4}
                  />
                </motion.div>

                {/* Settings Row */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Aspect Ratio */}
                  <div>
                    <Label htmlFor="aspect-ratio" className="text-lg font-semibold text-gray-800 mb-4 block">
                      Format
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-2xl bg-white/50 backdrop-blur-sm text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-gray-200">
                        {aspectRatioOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-lg py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <Label htmlFor="model" className="text-lg font-semibold text-gray-800 mb-4 block">
                      Quality
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isGenerating}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-2xl bg-white/50 backdrop-blur-sm text-lg">
                        <SelectValue>{getModelLabel(selectedModel)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 border-gray-200">
                        {modelOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value} className="text-lg py-3">
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-5 w-5 text-orange-600" />
                                <div className="flex flex-col">
                                  <span className="font-semibold">{option.label}</span>
                                  <span className="text-sm text-gray-500">{option.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                {/* Generate Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="pt-4"
                >
                  <Button
                    onClick={generateImages}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-6 w-6" />
                        </motion.div>
                        <span>Creating your masterpiece...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6" />
                        <span>Generate Images</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="mt-12"
            >
              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-16 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Loader2 className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-800 mb-4"
                  >
                    Crafting your vision
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-600 mb-8"
                  >
                    Our AI is working its magic to bring your imagination to life
                  </motion.p>
                  
                  {enhancedPrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-orange-800">Enhanced Prompt:</p>
                        <Button
                          onClick={copyEnhancedPrompt}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-orange-200 rounded-full"
                        >
                          {copiedPrompt ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-orange-600" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{enhancedPrompt}&rdquo;</p>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300 rounded-full"
                  >
                    <Sparkles className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">AI is creating magic...</span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="mt-16"
            >
              <motion.div 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center mb-12"
              >
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent tracking-tight">
                  Your Creations
                </h2>
                <p className="text-xl text-gray-600">Here are your AI-generated masterpieces</p>
              </motion.div>
              
              {enhancedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mb-12 max-w-4xl mx-auto p-8 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-3xl backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <p className="text-lg font-semibold text-orange-800">Enhanced Prompt Used:</p>
                      <Button
                        onClick={copyEnhancedPrompt}
                        size="sm"
                        variant="ghost"
                        className="h-10 w-10 p-0 hover:bg-orange-200 rounded-full"
                      >
                        {copiedPrompt ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-orange-600" />
                        )}
                      </Button>
                    </div>
                    <p className="text-lg text-gray-800 italic leading-relaxed">&ldquo;{enhancedPrompt}&rdquo;</p>
                  </div>
                </motion.div>
              )}
              
              <div className={`grid gap-8 ${images.length === 1 ? 'justify-center max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.8 + (index * 0.1),
                      type: "spring",
                      stiffness: 100
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl bg-white/80 backdrop-blur-xl">
                      <CardContent className="p-0">
                        <div className="relative">
                          <motion.img
                            src={image.url}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-auto rounded-3xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => downloadImage(image.url, index)}
                          />
                          <motion.div 
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-500 flex items-center justify-center rounded-3xl"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            onClick={() => downloadImage(image.url, index)}
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              whileHover={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-3 text-white font-semibold px-6 py-4 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/20"
                            >
                              <Download className="h-6 w-6" />
                              <span className="text-lg">Download Image</span>
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
    </div>
  );
}