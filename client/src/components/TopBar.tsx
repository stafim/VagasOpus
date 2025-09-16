import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
}

export default function TopBar({
  title = "Dashboard",
  showCreateButton = false,
  onCreateClick,
  createButtonText = "Nova Vaga",
}: TopBarProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            data-testid="button-mobile-menu"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
          <h2 className="ml-2 md:ml-0 text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg"></i>
          </button>
          {showCreateButton && onCreateClick && (
            <Button onClick={onCreateClick} data-testid="button-create-job">
              <i className="fas fa-plus mr-2"></i>
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
