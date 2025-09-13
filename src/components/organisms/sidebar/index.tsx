import { Button } from "@/components/atoms/ui/button";
import { cn } from "@/lib/utils";
import { HomeIcon, KeyboardIcon, SidebarOpen } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    label: "Keyboard Meta",
    href: "/settings",
    icon: <KeyboardIcon />,
  },
];

function Sidebar() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden",
        "transition-[width] duration-300 ease-in-out",
        open ? "w-64" : "w-12"
      )}
    >
      <div className="flex flex-col gap-1 p-2 h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(open ? "self-start" : "self-center")}
        >
          <SidebarOpen
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              !open && "rotate-180"
            )}
          />
        </Button>
        <nav className="mt-2 flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md h-9",
                  open
                    ? "justify-start gap-3 px-2"
                    : "justify-center gap-0 px-0",
                  "text-sm hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent"
                )
              }
              aria-label={link.label}
              title={link.label}
            >
              <span className="grid place-items-center w-6 h-6 text-current">
                {/* Ensure icons are a consistent size */}
                <span className="[&>*]:w-5 [&>*]:h-5">{link.icon}</span>
              </span>
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  open ? "opacity-100" : "opacity-0 hidden"
                )}
              >
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
