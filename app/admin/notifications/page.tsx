import { NotificationStats } from "@/components/admin/notification-stats";
import { NotificationCenter } from "@/components/admin/notification-center";
import { NotificationComposer } from "@/components/admin/notification-composer";

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">SMS, WhatsApp alerts and staff communication</p>
        </div>
      </div>

      <NotificationStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NotificationCenter />
        </div>
        <div>
          <NotificationComposer />
        </div>
      </div>
    </div>
  );
}
