import { X, Menu } from "lucide-react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "./sheet";
import { Sidebar } from "./sidebar";

export function MobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 px-4 flex items-center z-20">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-blue-500">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-48 flex flex-col p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Access navigation options</SheetDescription>
          <SheetClose className="absolute right-4 top-4">
            <X className="h-4 w-4 text-blue-500" />
            <span className="sr-only">Close menu</span>
          </SheetClose>
          <div className="mt-10 flex-1 flex flex-col h-full">
            <Sidebar className="w-full h-full" isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
