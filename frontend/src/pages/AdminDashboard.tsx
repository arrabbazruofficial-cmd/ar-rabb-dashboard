import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Users, Building2, FileText, Plane } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Agencies", value: "142", icon: Building2, trend: "+12%" },
    { label: "Total Customers", value: "8,204", icon: Users, trend: "+4%" },
    { label: "Visa Requests", value: "48", icon: FileText, trend: "+20%" },
    { label: "Ticket Requests", value: "12", icon: Plane, trend: "-2%" },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of platform activity and incoming travel requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6 h-[400px]">
            <h3 className="font-semibold mb-4">Request Activity</h3>
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-border rounded-lg text-muted-foreground">
              [Chart Placeholder - Recharts]
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px]">
            <h3 className="font-semibold mb-4">Recent Requests</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium">REQ-{1000 + i}</p>
                    <p className="text-xs text-muted-foreground">Group Visa • Al-Aman Tours</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
