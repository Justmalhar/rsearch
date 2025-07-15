"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function SettingsPage() {
  const [autoExpandSections, setAutoExpandSections] = useState(true);
  const [enableQueryRefinement, setEnableQueryRefinement] = useState(true);
  
  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoExpandSections(settings.autoExpandSections ?? true);
      setEnableQueryRefinement(settings.enableQueryRefinement ?? true);
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      autoExpandSections,
      enableQueryRefinement
    };
    localStorage.setItem("rSearch_settings", JSON.stringify(settings));
  }, [autoExpandSections, enableQueryRefinement]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl  font-bold text-orange-600">Settings</h1>
          <p className="text-orange-500/60 mt-2 ">Configure your search preferences</p>
        </header>

        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow border-orange-500 hover:border-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <ChevronDown className="h-4 w-4" />
                <CardTitle className=" text-lg">Display Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-expand" className="text-orange-600">
                  Auto-expand result sections
                  <p className="text-sm text-orange-500/80">
                    Automatically expand refined query, sources, thinking and results sections
                  </p>
                </Label>
                <Switch
                  id="auto-expand"
                  checked={autoExpandSections}
                  onCheckedChange={setAutoExpandSections}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="query-refinement" className="text-orange-600">
                  Enable query refinement
                  <p className="text-sm text-orange-500/80">
                    Allow AI to improve your search queries for better results
                  </p>
                </Label>
                <Switch
                  id="query-refinement"
                  checked={enableQueryRefinement}
                  onCheckedChange={setEnableQueryRefinement}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-500 hover:border-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles className="h-4 w-4" />
                <CardTitle className=" text-lg">Try Our New Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Link 
                href="/image" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Try our new Image Generator
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
