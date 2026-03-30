import { WildlifeStats } from "@/components/admin/wildlife-stats";
import { SightingsLog } from "@/components/admin/sightings-log";
import { WeatherWidget } from "@/components/admin/weather-widget";
import { SightingForm } from "@/components/admin/sighting-form";

export default function WildlifePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Wildlife & Weather</h1>
          <p className="text-muted-foreground">Track animal sightings and conditions for guests</p>
        </div>
      </div>

      <WildlifeStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SightingsLog />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <SightingForm />
        </div>
      </div>
    </div>
  );
}
