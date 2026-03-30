import { EmailStats } from "@/components/admin/email-stats";
import { EmailTemplates } from "@/components/admin/email-templates";
import { EmailCampaign } from "@/components/admin/email-campaign";

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">
          Email Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage email templates and send campaigns to your guests
        </p>
      </div>

      <EmailStats />

      <div className="grid lg:grid-cols-2 gap-6">
        <EmailTemplates />
        <EmailCampaign />
      </div>
    </div>
  );
}
