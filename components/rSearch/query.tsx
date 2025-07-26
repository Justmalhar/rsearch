
import { 
  Globe, BookText, Video, ShoppingBag, MapPin, Newspaper, GraduationCap, Lightbulb 
} from "lucide-react";



interface QueryProps {
  searchTerm: string;
  mode?: string;
}

export default function Query({ searchTerm, mode = 'web' }: QueryProps) {
  const searchModes = {
    web: Globe,
    images: BookText,   
    videos: Video, 
    news: Newspaper,
    places: MapPin,
    shopping: ShoppingBag,
    scholar: GraduationCap,
    patents: Lightbulb
  };

  const Icon = searchModes[mode as keyof typeof searchModes] || Globe;

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-serif font-bold text-blue-600">
          {searchTerm}
        </h1>
      </div>
    </div>
  );
}
    