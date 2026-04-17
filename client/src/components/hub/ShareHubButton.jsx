import { Share2 } from "lucide-react";
import { Button } from "@components/common/Button.jsx";
import { toast } from "sonner";

export function ShareHubButton({ inviteCode, eventName }) {
  const url = `${window.location.origin}/e/${inviteCode}`;
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied");
        } catch {
          toast.error("Could not copy");
        }
      }}
      aria-label={eventName ? `Share ${eventName}` : "Share hub link"}
    >
      <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
      Copy link
    </Button>
  );
}
