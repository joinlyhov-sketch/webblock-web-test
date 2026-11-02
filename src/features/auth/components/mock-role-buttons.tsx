import { Button } from "@/components/ui/button";

/**
 * TEMPORARY: one-click entry while the real login doesn't exist. Posts to the mock route
 * `/api/mock-auth`, which sets the `wb_role` cookie and redirects to /websites or /admin.
 * TODO(auth): delete this component (and its use in SignInForm) when the Spring login is connected.
 */
export function MockRoleButtons({ next = null }: { next?: string | null }) {
  return (
    <form
      method="post"
      action="/api/mock-auth"
      className="flex flex-col gap-2.5 rounded-[14px] border border-dashed border-border-strong/50 bg-muted px-3.5 py-3"
    >
      {next && <input type="hidden" name="next" value={next} />}
      <p className="text-[13px] text-muted-foreground">
        Temporary access while login isn&apos;t connected yet
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button type="submit" name="role" value="USER" variant="secondary" size="sm">
          Enter as User
        </Button>
        <Button type="submit" name="role" value="ADMIN" variant="soft" size="sm">
          Enter as Admin
        </Button>
      </div>
    </form>
  );
}
