// components/Header.jsx
"use client";

import { Sheet, SheetContent, SheetTrigger } from "app/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "app/components/ui/avatar";
import { Button } from "app/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar"; // Import the Sidebar component

export function Header({ userRole = "student" }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b border-gray-200 md:justify-end">
      {/* Mobile menu trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* User profile section */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium hidden sm:block">¡Hola, John!</span>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="appshadcn" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}