import { X } from "lucide-react";
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
          <Button variant="ghost" size="icon" className="text-orange-500">
            <svg width="24" height="24" viewBox="0 0 52 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.0344 0.5H29.6344C32.1544 0.5 33.1144 1.34 32.8744 3.62L31.5544 17.42C31.4344 18.26 31.9144 18.5 32.5144 17.9L43.5544 9.98C45.8344 8.66 46.7944 8.78 47.9944 11.18L51.2344 16.7C52.5544 18.86 52.1944 20.18 49.9144 21.14L37.1944 27.02C36.7144 27.38 36.7144 27.74 37.1944 27.98L49.9144 33.74C52.1944 34.82 52.5544 36.02 51.1144 38.06L47.9944 43.7C46.7944 45.74 45.5944 46.22 43.5544 44.9L32.5144 36.62C32.0344 36.14 31.4344 36.5 31.5544 37.22L32.6344 51.38C32.8744 53.78 32.0344 54.5 29.6344 54.5H23.0344C20.6344 54.5 19.7944 53.78 19.9144 51.38L21.2344 37.22C21.3544 36.5 20.8744 36.14 20.2744 36.62L8.99436 44.9C7.07436 46.22 5.87436 45.74 4.67436 43.7L1.55436 38.06C0.23436 36.02 0.35436 34.82 2.75436 33.74L15.5944 27.98C16.0744 27.74 16.0744 27.38 15.5944 27.02L2.63436 21.14C0.59436 20.18 0.23436 18.86 1.55436 16.7L4.67436 11.18C5.87436 8.78 7.07436 8.66 8.99436 9.98L20.2744 17.9C20.8744 18.5 21.3544 18.26 21.2344 17.42L19.9144 3.62C19.6744 1.34 20.6344 0.5 23.0344 0.5Z" fill="#EA580C"/>
            </svg>
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-48 flex flex-col p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Access navigation options</SheetDescription>
          <SheetClose className="absolute right-4 top-4">
            <X className="h-4 w-4 text-orange-500" />
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
