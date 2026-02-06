// app/dashboard/project/page.tsx (Calculator + export - updated)
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveProjectAction } from "@/app/dashboard/project/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

const schema = z.object({
  projectName: z.string().min(1),
  projectType: z.string(),
  floorArea: z.number().min(1),
  cement: z.string(), // material ID
  steel: z.string(),
  // Add more
});

export default function ProjectPage() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Calculate (simple logic)
    const costLow = data.floorArea * 1.5; // example
    const costHigh = data.floorArea * 2.25;
    const carbon = data.floorArea * 0.135; // example
    const baselineCarbon = data.floorArea * 0.2;

    // Save to DB (server action or API)
    await saveProjectAction({
      name: data.projectName,
      projectType: data.projectType,
      floorArea: data.floorArea,
      selectedMaterials: { cement: data.cement, steel: data.steel },
      costLow,
      costHigh,
      carbon,
      baselineCarbon,
    });

    // Generate PDF
    const _docDefinition = {
      content: [
        { text: "Carbon Smart Spaces Beta", style: "header" },
        { text: `Project: ${data.projectName}` },
        `Estimated Cost: ${costLow}-${costHigh} USD`,
        `Estimated Carbon: ${carbon} kg CO₂e (vs baseline ${baselineCarbon}, ${(((baselineCarbon - carbon) / baselineCarbon) * 100).toFixed(1)}% reduction)`,
      ],
      styles: { header: { fontSize: 18, bold: true } },
    };
    // pdfMake.createPdf(docDefinition).download('project-summary.pdf');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Project Calculator</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Project Name" {...register("projectName")} />
        <Select {...register("projectType")}>
          <SelectTrigger>
            <SelectValue placeholder="Project Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Floor Area (m²)"
          {...register("floorArea", { valueAsNumber: true })}
        />
        {/* Material selectors: Use dropdowns fetching from DB */}
        <Button type="submit">Generate Summary PDF</Button>
      </form>
    </div>
  );
}
