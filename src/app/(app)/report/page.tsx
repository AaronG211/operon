import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get latest health check report
  const { data: reports } = await supabase
    .from("reports")
    .select("id, restaurant_id, report_type, created_at")
    .eq("report_type", "health_check")
    .order("created_at", { ascending: false })
    .limit(1);

  if (reports && reports.length > 0) {
    redirect(`/report/${reports[0].id}`);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">No Reports Yet</h2>
        <p className="mt-2 text-muted-foreground">
          Complete the onboarding process to generate your first health check
          report.
        </p>
      </div>
    </div>
  );
}
