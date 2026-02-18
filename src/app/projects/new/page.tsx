import {
  ArrowLeft,
  Building2,
  Layers,
  LayoutDashboard,
  MapPin,
  Plus,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth/sign-in");
  }

  async function create(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "");
    const projectType = String(formData.get("projectType") ?? "residential") as
      | "residential"
      | "commercial";
    const floorAreaM2 = Number(formData.get("floorAreaM2") ?? 0);
    const location = String(formData.get("location") ?? "");

    const project = await createProjectAction({
      name,
      projectType,
      location,
      floorArea: floorAreaM2,
    });

    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Portfolio
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
          <LayoutDashboard className="h-4 w-4" />
          Workspace
        </div>
        <h1 className="text-4xl font-black tracking-tight">Create Project</h1>
        <p className="text-muted-foreground mt-2">
          Initialize your project to start tracking carbon and sourcing
          materials.
        </p>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 bg-background">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form action={create} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Project Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    name="name"
                    id="name"
                    required
                    placeholder="e.g. Skyline Apartments"
                    className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="projectType"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Project Type
                  </Label>
                  <select
                    name="projectType"
                    id="projectType"
                    className="w-full h-12 rounded-xl border border-muted bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    defaultValue="residential"
                  >
                    <option value="residential">Residential Building</option>
                    <option value="commercial">Commercial Office</option>
                    <option value="industrial">Industrial Facility</option>
                    <option value="infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="floorAreaM2"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Floor Area (m² GFA)
                  </Label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      name="floorAreaM2"
                      id="floorAreaM2"
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2500"
                      className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                >
                  Location (Country)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    name="location"
                    id="location"
                    required
                    placeholder="e.g. Ethiopia"
                    className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex items-center justify-between gap-4">
              <Link href="/projects" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-2 h-12 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
              >
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
