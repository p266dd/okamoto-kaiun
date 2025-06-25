"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useLinkStatus } from "next/link";

export default function LinkLoadingIndicator() {
  const { pending } = useLinkStatus();

  return pending ? (
    <span>
      <LoaderCircleIcon className="animate-spin" />
    </span>
  ) : null;
}
