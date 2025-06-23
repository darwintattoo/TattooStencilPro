import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";

export interface GenerationSettings {
  style: string;
  lineWeight: string;
  guidanceScale: number;
  steps: number;
  aspectRatio: string;
}

interface AdvancedSettingsProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

export default function AdvancedSettings({ 
  settings, 
  onSettingsChange 
}: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const aspectRatios = [
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" }
  ];

  return (
    <Card className="bg-slate-700 border-slate-600">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-600/50 transition-colors rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <Settings className="text-slate-400 h-5 w-5" />
              <span className="font-semibold">Advanced Settings</span>
            </div>
            {isOpen ? (
              <ChevronUp className="text-slate-400 h-5 w-5" />
            ) : (
              <ChevronDown className="text-slate-400 h-5 w-5" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 space-y-6 border-t border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Style Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-300">Style & Aesthetics</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-400">Art Style</Label>
                  <Select 
                    value={settings.style} 
                    onValueChange={(value) => updateSetting('style', value)}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="neo-traditional">Neo-Traditional</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="blackwork">Blackwork</SelectItem>
                      <SelectItem value="geometric">Geometric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-400">Line Weight</Label>
                  <Select 
                    value={settings.lineWeight} 
                    onValueChange={(value) => updateSetting('lineWeight', value)}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="fine">Fine Lines</SelectItem>
                      <SelectItem value="medium">Medium Lines</SelectItem>
                      <SelectItem value="bold">Bold Lines</SelectItem>
                      <SelectItem value="variable">Variable Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Technical Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-300">Generation Settings</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-400">
                    Guidance Scale: <span className="text-slate-300">{settings.guidanceScale}</span>
                  </Label>
                  <Slider
                    value={[settings.guidanceScale]}
                    onValueChange={(value) => updateSetting('guidanceScale', value[0])}
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-400">
                    Steps: <span className="text-slate-300">{settings.steps}</span>
                  </Label>
                  <Slider
                    value={[settings.steps]}
                    onValueChange={(value) => updateSetting('steps', value[0])}
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-400">Aspect Ratio</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={settings.aspectRatio === ratio.value ? "default" : "outline"}
                    className={`px-4 py-2 text-sm transition-colors ${
                      settings.aspectRatio === ratio.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-blue-600 hover:border-blue-500'
                    }`}
                    onClick={() => updateSetting('aspectRatio', ratio.value)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
