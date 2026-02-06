import type { NextRequest } from "next/server";
import PDFDocument from "pdfkit";

import { getProjectSummaryAction } from "../../actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const summary = await getProjectSummaryAction((await params).id);

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Project Summary - ${summary.project.name}`,
      Author: "Carbon Smart Spaces",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) =>
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
  );

  // Watermark
  doc
    .fontSize(10)
    .fillColor("#888")
    .text("Carbon Smart Spaces Beta", { align: "right" });
  doc.moveDown();

  // Header
  doc.fillColor("#000").fontSize(16).text("Project Summary", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Project: ${summary.project.name}`);
  doc.text(`Floor area: ${summary.project.floorAreaM2} m²`);
  doc.text(`Location: ${summary.project.locationCountry}`);
  doc.moveDown();

  // Materials
  doc.fontSize(14).text("Selected Materials");
  doc.moveDown(0.5);
  doc.fontSize(11);
  summary.items.forEach((it) => {
    if (!it) return;
    doc.text(`${it.name} • ${it.category} • ${it.quantity} ${it.unit}`);
    doc.text(
      `Supplier: ${it.supplierName} • Origin: ${it.origin} • Lead: ${it.leadTimeEstimate ?? "—"}`,
    );
    doc.text(`Transport multiplier: ${it.transportMultiplier.toFixed(2)}`);
    doc.text(
      `Carbon: ${it.carbon.toFixed(2)} • Cost: ${it.costMin.toFixed(2)} – ${it.costMax.toFixed(2)}`,
    );
    doc.text(
      `Baseline Δ carbon: ${it.baseline.carbonDiffAbs.toFixed(2)} (${(it.baseline.carbonDiffPct * 100).toFixed(1)}%)`,
    );
    doc.text(
      `Baseline Δ cost(mid): ${it.baseline.costMidDiffAbs.toFixed(2)} (${(it.baseline.costMidDiffPct * 100).toFixed(1)}%)`,
    );
    doc.moveDown();
  });

  // Totals
  doc.fontSize(14).text("Totals");
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.text(`Total carbon: ${summary.totals.carbon.toFixed(2)}`);
  doc.text(
    `Total cost: ${summary.totals.costMin.toFixed(2)} – ${summary.totals.costMax.toFixed(2)}`,
  );
  doc.moveDown();

  // Baseline note and watermark
  doc
    .fontSize(10)
    .fillColor("#666")
    .text("Baseline comparison is contextual only (not certification).");
  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#888")
    .text("Carbon Smart Spaces Beta", { align: "right" });

  doc.end();
  const buffer = Buffer.concat(chunks);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="project-summary-${summary.project.id}.pdf"`,
    },
  });
}
