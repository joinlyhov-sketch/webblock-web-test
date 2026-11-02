"use client";

import { useState } from "react";
import {
  Eye,
  Forbidden2,
  Global,
  PlayCircle,
  Profile,
  Refresh2,
  Sms,
} from "iconsax-reactjs";
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/components/common/action-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  redeployWebsiteAction,
  resumeWebsiteAction,
  suspendWebsiteAction,
} from "../actions";
import type { AdminWebsite } from "../types";
import { ContactOwnerDialog } from "./contact-owner-dialog";
import { useAdminAction } from "./use-admin-action";

type WebsiteRef = Pick<
  AdminWebsite,
  | "id"
  | "name"
  | "domain"
  | "ownerName"
  | "ownerEmail"
  | "siteStatus"
  | "releaseStatus"
  | "liveRelease"
  | "redeploysLeft"
>;

/** Disabled reason for a live site: the button keeps its normal label. */
const LIVE_BLOCKED = "Site is live";

/** Why redeploy is unavailable, or null when it can run. The backend re-checks all of this. */
function redeployBlocked(website: WebsiteRef): string | null {
  if (website.releaseStatus === "GOING_LIVE") return "Deploying…";
  // A suspended site can be redeployed; a healthy live one has nothing to redeploy.
  if (website.siteStatus !== "SUSPENDED" && website.releaseStatus === "LIVE")
    return LIVE_BLOCKED;
  if (website.redeploysLeft <= 0) return "No redeploys left";
  return null;
}

/** New key per click: a double-submit of the same click is ignored by the backend. */
const redeploy = (website: WebsiteRef) => () =>
  redeployWebsiteAction(website.id, crypto.randomUUID());

/** Row "⋯" menu on User Websites. */
export function WebsiteRowMenu({
  website,
  detailHref,
}: {
  website: WebsiteRef;
  detailHref: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [contact, setContact] = useState(false);
  const [pending, run] = useAdminAction();
  const suspended = website.siteStatus === "SUSPENDED";

  const items: ActionMenuItem[] = [
    { label: "View details", icon: <Eye variant="Outline" />, href: detailHref },
    ...(website.liveRelease && !suspended
      ? [
          {
            label: "Open live site",
            icon: <Global variant="Outline" />,
            externalHref: `/sites/${website.id}`,
          },
        ]
      : []),
    // A live site needs no redeploy: it is only offered after a failed release or while suspended.
    ...(website.releaseStatus === "FAILED" || suspended
      ? [
          {
            label: "Redeploy",
            icon: <Refresh2 variant="Outline" />,
            disabled: redeployBlocked(website) !== null || pending,
            onSelect: () =>
              run(redeploy(website), `Redeploying ${website.name}`),
          },
        ]
      : []),
    {
      label: "Contact owner",
      icon: <Sms variant="Outline" />,
      onSelect: () => setContact(true),
    },
    suspended
      ? {
          label: "Resume hosting",
          icon: <PlayCircle variant="Outline" />,
          onSelect: () =>
            run(
              () => resumeWebsiteAction(website.id),
              `${website.name} is back online`,
            ),
        }
      : {
          label: "Suspend website",
          icon: <Forbidden2 variant="Outline" />,
          danger: true,
          onSelect: () => setConfirm(true),
        },
  ];

  return (
    <>
      <ActionMenu label={`Actions for ${website.name}`} items={items} />
      <ContactOwnerDialog website={website} open={contact} onOpenChange={setContact} />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        pending={pending}
        icon={<Forbidden2 variant="Outline" />}
        title="Suspend this website?"
        description="It will be taken offline and visitors won't be able to see it. Its pages and content are kept, so you can resume hosting any time."
        confirmLabel="Suspend website"
        look="soft"
        onConfirm={() =>
          run(
            () => suspendWebsiteAction(website.id),
            `${website.name} suspended`,
            () => setConfirm(false),
          )
        }
      />
    </>
  );
}

/** Footer of the website detail popup: Contact owner · Redeploy. */
export function WebsiteDetailActions({ website }: { website: WebsiteRef }) {
  const [pending, run] = useAdminAction();
  const [contact, setContact] = useState(false);
  const blocked = redeployBlocked(website);

  return (
    <>
      <Button variant="secondary" size="sm" className="flex-1" onClick={() => setContact(true)}>
        <Profile variant="Outline" />
        Contact owner
      </Button>
      <ContactOwnerDialog website={website} open={contact} onOpenChange={setContact} />
      <Button
        size="sm"
        className="flex-1"
        loading={pending}
        disabled={blocked !== null}
        onClick={() => run(redeploy(website), `Redeploying ${website.name}`)}
      >
        {!pending && <Refresh2 variant="Outline" />}
        {blocked && blocked !== LIVE_BLOCKED ? blocked : "Redeploy website"}
      </Button>
    </>
  );
}
