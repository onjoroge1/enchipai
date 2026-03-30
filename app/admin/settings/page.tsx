import { SettingsTabs } from "@/components/admin/settings-tabs";
import { HeroEditor } from "@/components/admin/hero-editor";
import { CacheManager } from "@/components/admin/cache-manager";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your camp configuration, users, and preferences</p>
        </div>
      </div>

      <HeroEditor />

      <CacheManager />

      <SettingsTabs />
    </div>
  );
}
