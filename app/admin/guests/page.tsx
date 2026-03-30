import { GuestsTable } from "@/components/admin/guests-table";
import { GuestStats } from "@/components/admin/guest-stats";
import { GuestPreferences } from "@/components/admin/guest-preferences";

export default function GuestsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Guest Management</h1>
        <p className="text-muted-foreground">View and manage all guest profiles and history</p>
      </div>

      <GuestStats />

      <div className="mt-8">
        <GuestsTable />
      </div>

      <div className="mt-8">
        <GuestPreferences />
      </div>
    </>
  );
}
