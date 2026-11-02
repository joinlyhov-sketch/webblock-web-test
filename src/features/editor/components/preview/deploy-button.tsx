"use client";

import { useTransition } from "react";
import { Send2 as Rocket } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { useDeploy } from "./use-deploy";

/** "Deploy" from Preview: the draft on screen is already saved, so it asks the backend to deploy it. */
export function DeployButton({ websiteId }: { websiteId: string }) {
  const [pending, startTransition] = useTransition();
  const deploy = useDeploy(websiteId);

  return (
    <Button
      size="sm"
      loading={pending}
      onClick={() => startTransition(async () => void (await deploy()))}
    >
      {!pending && <Rocket />} Deploy
    </Button>
  );
}
