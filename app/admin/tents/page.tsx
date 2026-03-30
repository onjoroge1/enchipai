import { TentsList } from "@/components/admin/tents-list";
import { TentDisplayControl } from "@/components/admin/tent-display-control";
import { TentCalendar } from "@/components/admin/tent-calendar";
import { SeasonRatesManaged } from "@/components/admin/season-rates-managed";

export default function TentsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Tent Management</h1>
        <p className="text-muted-foreground">Manage tent availability, pricing, and maintenance</p>
      </div>

      <TentsList />

      <div className="mt-8">
        <TentDisplayControl />
      </div>

      <div className="mt-8">
        <TentCalendar />
      </div>

      <div className="mt-8">
        <SeasonRatesManaged />
      </div>
    </>
  );
}
