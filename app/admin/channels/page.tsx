import { ChannelStats } from "@/components/admin/channel-stats";
import { ChannelList } from "@/components/admin/channel-list";
import { ChannelSync } from "@/components/admin/channel-sync";

export default function ChannelsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Channel Manager</h1>
          <p className="text-muted-foreground">Manage OTA integrations and sync availability</p>
        </div>
      </div>

      <ChannelStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChannelList />
        </div>
        <div>
          <ChannelSync />
        </div>
      </div>
    </div>
  );
}
