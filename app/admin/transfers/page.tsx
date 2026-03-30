import { TransferStats } from "@/components/admin/transfer-stats";
import { TransferSchedule } from "@/components/admin/transfer-schedule";
import { VehicleFleet } from "@/components/admin/vehicle-fleet";
import { VehicleMaintenance } from "@/components/admin/vehicle-maintenance";

export default function TransfersPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Transfers & Vehicles</h1>
        <p className="text-muted-foreground">
          Manage airport transfers, safari vehicles, and maintenance schedules
        </p>
      </div>

      <TransferStats />

      <div className="mt-8">
        <TransferSchedule />
      </div>

      <div className="mt-8">
        <VehicleFleet />
      </div>

      <div className="mt-8">
        <VehicleMaintenance />
      </div>
    </>
  );
}
