import { ExperienceStats } from "@/components/admin/experience-stats";
import { ExperiencesList } from "@/components/admin/experiences-list";
import { ExperienceBookings } from "@/components/admin/experience-bookings";

export default function ExperiencesPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Experience Management</h1>
        <p className="text-muted-foreground">
          Manage safari activities, game drives, and guest experiences
        </p>
      </div>

      <ExperienceStats />

      <div className="mt-8">
        <ExperiencesList />
      </div>

      <div className="mt-8">
        <ExperienceBookings />
      </div>
    </>
  );
}
