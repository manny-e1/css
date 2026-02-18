import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronDown,
  DollarSign,
  Info,
  Layers,
  MapPin,
  Plus,
  Send,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCategoriesAction } from "@/app/materials/actions";
import { CategorySelector } from "@/components/bids/category-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db/client";
import { projects } from "@/db/new-schema";
import { auth } from "@/lib/auth";
import { createSourcingRequestAction } from "../actions";

export default async function CreateSourcingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const user = session.user;
  const isSupplier = user.role === "supplier";

  if (isSupplier) {
    redirect("/sourcing");
  }

  const params = await searchParams;
  const projectId = params.projectId ? String(params.projectId) : undefined;
  const initialCategory = params.category ? String(params.category) : "";
  const initialQuantity = params.quantity ? Number(params.quantity) : "";

  const project = projectId
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .then((res) => res[0])
    : null;

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id));

  const categories = await getCategoriesAction();

  async function createRequest(formData: FormData) {
    "use server";
    const selectedProjectId = formData.get("projectId")
      ? String(formData.get("projectId"))
      : undefined;
    const category = String(formData.get("category") ?? "");
    const subCategory = String(formData.get("subCategory") ?? "");
    const quantity = Number(formData.get("quantity") ?? 0);
    const unit = String(formData.get("unit") ?? "");
    const requestType = String(formData.get("requestType") ?? "material");
    const location = String(formData.get("location") ?? "");
    const deadline = formData.get("deadline") as string;
    const notes = formData.get("notes") as string;

    await createSourcingRequestAction({
      projectId: selectedProjectId || undefined,
      category,
      subCategory,
      quantity,
      unit,
      requestType,
      location,
      deadline,
      notes,
    });

    if (selectedProjectId) {
      redirect(`/projects/${selectedProjectId}`);
    } else {
      redirect("/buyer/sourcing");
    }
  }

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-5xl">
      <div className="mb-12 space-y-6">
        <Link
          href="/sourcing"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sourcing Hub
        </Link>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-wider">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Supply Chain Hub
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Create <span className="text-primary">Sourcing Request</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Broadcast your material or service needs to our network of
            registered suppliers.
          </p>
        </div>
      </div>

      <Card className="border-border rounded-2xl overflow-hidden bg-background shadow-sm">
        <CardHeader className="border-b bg-muted/50 py-8 px-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Request Details
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Technical Specifications & Scope
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <form action={createRequest} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Project Association (Optional)
                </Label>
                <div className="relative">
                  <select
                    name="projectId"
                    defaultValue={projectId || ""}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">None (Open Request)</option>
                    {userProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Request Type
                </Label>
                <div className="relative">
                  <select
                    name="requestType"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="material">Material Supply</option>
                    <option value="service">Service Work</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <CategorySelector
              categories={categories}
              initialCategory={initialCategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Delivery or Execution Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="location"
                    required
                    placeholder="e.g. London, UK or Project Site Address"
                    className="pl-12 h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Quantity
                </Label>
                <Input
                  name="quantity"
                  type="number"
                  required
                  defaultValue={initialQuantity}
                  placeholder="0"
                  className="h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Unit
                </Label>
                <Input
                  name="unit"
                  placeholder="e.g. kg, m3, units"
                  className="h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Desired delivery or execution window
                </Label>
                <Input
                  name="deadline"
                  type="date"
                  className="h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Required Details & Notes
              </Label>
              <Textarea
                name="notes"
                required
                placeholder="Any additional information, preferred payment terms, or logistics constraints..."
                className="min-h-[160px] p-6 rounded-xl border-border font-medium focus-visible:ring-0 focus-visible:border-primary leading-relaxed resize-none bg-muted/30"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all"
              >
                Broadcast Request
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/sourcing" className="flex-1">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest border-border hover:bg-muted transition-all"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
