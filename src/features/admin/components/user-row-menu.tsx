"use client";

import { useState } from "react";
import { Eye, Forbidden2, TickCircle } from "iconsax-reactjs";
import { ActionMenu } from "@/components/common/action-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { reactivateUserAction, suspendUserAction } from "../actions";
import type { UserAccount } from "../types";
import { useAdminAction } from "./use-admin-action";

/** Row "⋯" menu on User Accounts: View details · Suspend user / Reactivate user. */
export function UserRowMenu({
  user,
  detailHref,
}: {
  user: Pick<UserAccount, "id" | "fullName" | "status">;
  detailHref: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, run] = useAdminAction();
  const suspended = user.status === "SUSPENDED";

  return (
    <>
      <ActionMenu
        label={`Actions for ${user.fullName}`}
        items={[
          { label: "View details", icon: <Eye variant="Outline" />, href: detailHref },
          suspended
            ? {
                label: "Reactivate user",
                icon: <TickCircle variant="Outline" />,
                onSelect: () =>
                  run(
                    () => reactivateUserAction(user.id),
                    `${user.fullName} reactivated`,
                  ),
              }
            : {
                label: "Suspend user",
                icon: <Forbidden2 variant="Outline" />,
                danger: true,
                onSelect: () => setConfirm(true),
              },
        ]}
      />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        pending={pending}
        icon={<Forbidden2 variant="Outline" />}
        title={`Suspend ${user.fullName}?`}
        description="They won't be able to sign in or edit their websites. Their websites and data are kept, so you can reactivate them any time."
        confirmLabel="Suspend user"
        look="soft"
        onConfirm={() =>
          run(
            () => suspendUserAction(user.id),
            `${user.fullName} suspended`,
            () => setConfirm(false),
          )
        }
      />
    </>
  );
}
