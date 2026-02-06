import {
  ArrowRight,
  Calendar,
  DollarSign,
  LayoutDashboard,
  Leaf,
  MapPin,
  Plus,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { listProjectsAction } from "./actions";

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = session.user;
  const isPro = user.role === "professional" || user.role === "admin";

  if (!isPro) {
    redirect("/materials"); // Redirect buyers to materials page since they can't use projects
  }

  // Fetch actual projects from database
  const dbProjects = await listProjectsAction();

  // Get project summaries with material data and carbon calculations
  const projectsWithSummaries = await Promise.all(
    dbProjects.map(async (project) => {
      const { getProjectSummaryAction } = await import("./actions");
      try {
        const summary = await getProjectSummaryAction(project.id);
        return {
          ...project,
          materialsUsed: summary.items.length,
          totalCarbon: summary.totals.carbon,
          totalCost: Math.round(summary.totals.costMax),
        };
      } catch (_error) {
        return {
          ...project,
          materialsUsed: 0,
          totalCarbon: 0,
          totalCost: 0,
        };
      }
    }),
  );

  const getStatusBadge = (projectType: string) => {
    const status = projectType || "planning";
    const colors: Record<string, string> = {
      planning: "bg-blue-100 text-blue-700",
      in_progress: "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      on_hold: "bg-slate-100 text-slate-700",
    };

    return (
      <Badge
        className={cn(
          "border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full",
          colors[status] || colors.planning,
        )}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const totalCarbonAcrossProjects = projectsWithSummaries.reduce(
    (acc, p) => acc + p.totalCarbon,
    0,
  );

  return (
    <div className="mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Project Portfolio
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Monitor and manage your sustainable construction pipeline.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/projects/new">
            <Button className="h-12 px-6 rounded-xl font-bold shadow-sm transition-all bg-primary text-white">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Aggregate Stats */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          {
            label: "Active Projects",
            value: projectsWithSummaries.length,
            icon: LayoutDashboard,
            color: "text-primary",
            bg: "bg-primary/5",
          },
          {
            label: "Total Carbon Offset",
            value: `${Math.round(totalCarbonAcrossProjects)} kg`,
            icon: Leaf,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Portfolio Value",
            value: `$${(
              projectsWithSummaries.reduce((acc, p) => acc + p.totalCost, 0) /
              1000
            ).toFixed(1)}k`,
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-border/60 transition-all rounded-xl shadow-sm bg-background"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center shadow-sm",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">
                    {stat.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {projectsWithSummaries.length === 0 ? (
        <Card className="border-dashed border-2 py-24 rounded-xl bg-muted/5 shadow-none flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-xl bg-background border border-border/40 shadow-sm flex items-center justify-center mb-6">
            <Plus className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            Start by creating your first sustainable construction project to
            track carbon and costs.
          </p>
          <Link href="/projects/new">
            <Button className="h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-sm">
              <Plus className="h-5 w-5 mr-2" />
              Create First Project
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithSummaries.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group/card"
            >
              <Card className="h-full border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background transition-all hover:shadow-md hover:border-primary/20 flex flex-col">
                <CardHeader className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    {getStatusBadge(project.projectType || "planning")}
                    <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center group-hover/card:bg-primary/10 group-hover/card:text-primary transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight group-hover/card:text-primary transition-colors line-clamp-1 mb-2">
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 opacity-60" />
                    <span className="truncate">
                      {project.location || "Location not set"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-lg bg-muted/5 border border-border/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1.5">
                        <Leaf className="h-3 w-3 text-emerald-500/70" />
                        Carbon
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {Math.round(project.totalCarbon)}{" "}
                        <span className="text-[10px] opacity-40">kg</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/5 border border-border/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3 text-amber-500/70" />
                        Budget
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${(project.totalCost / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-auto pt-4 border-t border-border/40">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        <span>Progress</span>
                        <span className="text-primary">35%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full w-[35%] bg-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" />
                      Q3 2026 - Q1 2027
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
