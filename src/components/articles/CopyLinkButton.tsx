"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { AiOutlineLink } from "react-icons/ai";
import { toast } from "sonner";

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("リンクをコピーしました！");

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  return (
    <AiOutlineLink
      onClick={handleCopy}
      size={32}
      className={cn(
        copied && "text-green-500",
        "duration-300 transition-colors ease-in-out"
      )}
    />
  );
};

export default CopyLinkButton;
