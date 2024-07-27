import React from "react";
import Link from "next/link";
import { Menu, Package2, Search } from "lucide-react";

import { Button } from "~/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  return (
    <header className="sticky top-0 flex justify-between h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="w-fit text-lg font-medium">
        <Link
          href="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          GIT-SHIP-DONE
        </Link>
      </div>

      <div>
        <ThemeToggle />
      </div>
    </header>
  );
}
