import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { GroupVisaForm } from "@/components/forms/GroupVisaForm";

export default function AgencyDashboard() {
  return (
    <DashboardLayout role="AGENCY">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agency Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Submit and manage your travel requests seamlessly.
          </p>
        </div>

        <div className="mt-8">
          <GroupVisaForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
