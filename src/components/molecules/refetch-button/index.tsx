import { Button } from "@/components/atoms/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";
import { TooltipProvider } from "@/components/atoms/ui/tooltip";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/atoms/ui/tooltip";
import { useState } from "react";
type Props = {
  queryKey?: string;
};

function RefetchButton({ queryKey }: Props) {
  const queryClient = useQueryClient();
  const [isRefetching, setIsRefetching] = useState(false);
  const handleRefetch = () => {
    setIsRefetching(true);
    queryClient.invalidateQueries({
      queryKey: queryKey ? [queryKey] : undefined,
    });
    setIsRefetching(false);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            onClick={handleRefetch}
            disabled={isRefetching}
            variant="outline"
            size="icon"
          >
            {isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reload data</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default RefetchButton;
