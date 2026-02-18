"use client";

import {
  Briefcase,
  Building2,
  Calendar,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Send,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  createInquiryAction,
  getMaterialByIdAction,
} from "@/app/materials/actions";
import { listProjectsAction } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

interface Material {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  origin: string | null;
  unitPriceRange: string | null;
  leadTimeEstimate: string | null;
}

interface Project {
  id: string;
  name: string;
}

function CreateInquiryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const materialId = searchParams.get("materialId");
  const initialProjectId = searchParams.get("projectId");

  const [material, setMaterial] = useState<Material | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState<string>(
    initialProjectId || "unassigned",
  );
  const [quantity, setQuantity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (session?.user?.role === "supplier") {
      router.push("/materials");
      return;
    }

    async function loadData() {
      if (!materialId) {
        setError("No material specified for inquiry.");
        setLoading(false);
        return;
      }

      try {
        const [materialData, projectsData] = await Promise.all([
          getMaterialByIdAction(materialId),
          listProjectsAction(),
        ]);

        if (materialData) {
          setMaterial(materialData as unknown as Material);
          setNotes(
            `Hi ${materialData.supplierName},\n\nI am interested in ${materialData.name} for my project. Could you provide more details on availability and shipping?`,
          );
        } else {
          setError("Material not found.");
        }
        setProjects((projectsData as unknown as Project[]) || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load inquiry details.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [materialId, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId) return;

    setSubmitting(true);
    try {
      const selectedProject = projects.find((p) => p.id === projectId);
      await createInquiryAction({
        materialId,
        quantity: quantity ? parseFloat(quantity) : undefined,
        notes,
        projectId: projectId === "unassigned" ? undefined : projectId,
        projectName: selectedProject ? selectedProject.name : undefined,
        deliveryAddress,
        desiredDeliveryDate,
      });
      router.push("/inquiries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center pt-24">
        <Card className="border-destructive/20 shadow-sm rounded-xl bg-background overflow-hidden">
          <CardHeader className="bg-destructive/5 pb-8 pt-10 px-10 border-b border-destructive/10">
            <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Info className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-destructive">
              Error Encountered
            </CardTitle>
            <CardDescription className="text-muted-foreground/60 font-medium">
              {error || "Material not found."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button
              onClick={() => router.back()}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-12">
      <div className="mb-16 space-y-6">
        <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-wider">
          <div className="h-2 w-2 rounded-full bg-primary" />
          Direct Engagement
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
            Contact Supplier
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-4 max-w-2xl leading-relaxed font-medium">
            Initiate a direct conversation with the supplier to discuss pricing,
            technical specifications, or bulk logistics for your project.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Context & Details */}
        <div className="lg:col-span-4 space-y-12">
          <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background group/card transition-all">
            <CardHeader className="pb-8 pt-10 px-10 border-b border-border/40 bg-muted/2">
              <CardTitle className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-3">
                <Info className="h-4 w-4" />
                Material Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-10 space-y-10">
              <div className="group/item flex items-start gap-6">
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground tracking-tight">
                    {material.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 mt-1 uppercase font-bold tracking-wider">
                    {material.category}
                  </div>
                </div>
              </div>

              <div className="group/item flex items-start gap-6">
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground tracking-tight">
                    {material.supplierName}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 mt-1 uppercase font-bold tracking-wider">
                    {material.origin || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-dashed border-border/40 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider">
                    Price Range
                  </span>
                  <span className="text-base font-bold text-foreground tracking-tight">
                    ${material.unitPriceRange || "TBD"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider">
                    Lead Time
                  </span>
                  <span className="text-base font-bold text-foreground tracking-tight">
                    {material.leadTimeEstimate || "TBD"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-xl bg-primary/[0.02] border border-primary/10 text-primary shadow-sm transition-all group/link-box">
            <div className="flex items-center gap-3 font-bold mb-6 uppercase text-[10px] tracking-wider opacity-40">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5" />
              </div>
              Buyer-Supplier Link
            </div>
            <p className="text-sm leading-relaxed font-medium text-foreground/70">
              This inquiry creates a{" "}
              <span className="text-primary font-bold">
                private chat thread
              </span>
              . You can securely discuss custom terms, request samples, and
              coordinate logistics directly with the manufacturer's sales team.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-12">
            <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background">
              <CardHeader className="border-b border-border/40 bg-muted/2 py-8 px-10">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  Inquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label
                      htmlFor="project"
                      className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider ml-2 flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Assign to Project
                    </label>
                    <div className="relative group">
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger
                          id="project"
                          className="h-12 rounded-xl border-border/50 bg-background hover:border-primary/30 transition-all font-bold text-sm px-4"
                        >
                          <SelectValue placeholder="Select a project (optional)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50 shadow-sm p-2">
                          <SelectItem
                            value="unassigned"
                            className="rounded-lg focus:bg-primary/5 focus:text-primary font-bold text-sm py-2 px-3"
                          >
                            Unassigned / General Inquiry
                          </SelectItem>
                          {projects.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="rounded-lg focus:bg-primary/5 focus:text-primary font-bold text-sm py-2 px-3"
                            >
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label
                      htmlFor="quantity"
                      className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider ml-2 flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Estimated Quantity
                    </label>
                    <div className="relative group">
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="e.g. 500"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-12 rounded-xl border-border/50 bg-background hover:border-primary/30 transition-all focus:ring-primary/10 font-bold text-sm px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label
                      htmlFor="deliveryDate"
                      className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider ml-2 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Desired Delivery
                    </label>
                    <div className="relative group">
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={desiredDeliveryDate}
                        onChange={(e) => setDesiredDeliveryDate(e.target.value)}
                        className="h-12 rounded-xl border-border/50 bg-background hover:border-primary/30 transition-all focus:ring-primary/10 font-bold text-sm px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label
                      htmlFor="deliveryAddress"
                      className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider ml-2 flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Delivery Location
                    </label>
                    <div className="relative group">
                      <Input
                        id="deliveryAddress"
                        placeholder="Street, City, Country"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="h-12 rounded-xl border-border/50 bg-background hover:border-primary/30 transition-all focus:ring-primary/10 font-bold text-sm px-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    htmlFor="notes"
                    className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider ml-2 flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Initial Message
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Briefly describe your requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] rounded-xl border-border/50 bg-background hover:border-primary/30 transition-all focus:ring-primary/10 p-6 leading-relaxed font-medium resize-none text-base"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-12 px-10 rounded-xl font-bold text-xs uppercase tracking-wider border-border/50 hover:bg-muted transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all gap-2 bg-primary text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateInquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateInquiryContent />
    </Suspense>
  );
}
