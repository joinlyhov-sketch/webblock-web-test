import type { DeployView as DeployData } from "../service";
import Link from "next/link";
import { Clock } from "iconsax-reactjs";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { ChooseDomainView } from "./choose-domain-view";
import { DeployProgress } from "./deploy-progress";
import { DeployShell } from "./deploy-shell";
import { StartDeploy } from "./start-deploy";

/**
 * The Deploy screen: the address picker for a first deploy, the start right after paying for it,
 * otherwise the progress of the running deploy.
 */
export function DeployView({ view }: { view: DeployData }) {
  const { website } = view;
  const editorHref = `/websites/${website.id}/edit`;
  return (
    <DeployShell siteName={website.name}>
      {view.kind === "unavailable" ? (
        <EmptyState
          icon={<Clock aria-hidden />}
          title="Deployment details unavailable"
          description="We couldn't find this deployment. Return to the editor to check your website and start a new deploy."
          action={<Button asChild><Link href={editorHref}>Back to editor</Link></Button>}
        />
      ) : view.kind === "start" ? (
        <StartDeploy
          websiteId={website.id}
          idempotencyKey={view.idempotencyKey}
          editorHref={editorHref}
        />
      ) : view.kind === "choose-domain" ? (
        <ChooseDomainView
          websiteId={website.id}
          siteName={website.name}
          initialName={view.name}
          check={view.check}
        />
      ) : (
        <DeployProgress
          deployment={view.deployment}
          siteName={website.name}
          editorHref={editorHref}
        />
      )}
    </DeployShell>
  );
}
