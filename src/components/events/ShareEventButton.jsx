
import React, { useState } from 'react';
import { Share2, Copy, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const ShareEventButton = ({ eventTitle, eventId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/student/events/${eventId}`;
  
  const handleCopyLink = async () => {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success!",
        description: "Link copied to clipboard",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const shareToTwitter = () => {
    const text = `Check out this event: ${eventTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareToLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareViaEmail = () => {
    const subject = `Check out this event: ${eventTitle}`;
    const body = `I thought you might be interested in this event: ${eventTitle}\n\nView it here: ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyLink} disabled={isLoading} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4" />
          <span>Share to Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4" />
          <span>Share to Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedin} className="cursor-pointer">
          <Linkedin className="mr-2 h-4 w-4" />
          <span>Share to LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          <span>Share via Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareEventButton;
