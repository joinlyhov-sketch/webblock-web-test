import type { DeployView as DeployData } from "../service";
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
      {view.kind === "start" ? (
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
