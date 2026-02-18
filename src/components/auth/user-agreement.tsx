"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserAgreementProps {
  type: "buyer" | "supplier";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function UserAgreement({
  type,
  checked,
  onCheckedChange,
}: UserAgreementProps) {
  const [open, setOpen] = useState(false);

  const title =
    type === "buyer" ? "BUYER USER AGREEMENT" : "SUPPLIER USER AGREEMENT";

  const content =
    type === "buyer" ? (
      <div className="space-y-4 text-sm">
        <p>Effective Date: {new Date().toLocaleDateString()}</p>
        <p>
          This Buyer User Agreement (“Agreement”) governs your access to and use
          of the Carbon Smart Spaces platform (“Platform”), operated by KINE
          MODU.
        </p>
        <p>
          By creating an account, subscribing, or accessing any part of the
          Platform, you agree to be legally bound by this Agreement.
        </p>

        <h3 className="font-bold">1. Definitions</h3>
        <p>
          “Buyer” means any individual or entity accessing the Platform to
          search, compare, evaluate, or source materials from Suppliers.
        </p>
        <p>
          “Content” means all material data, product listings, carbon
          indicators, pricing ranges, reports, documents, communications, and
          other information made available on the Platform.
        </p>
        <p>
          “Supplier” means any business listing materials or services on the
          Platform.
        </p>

        <h3 className="font-bold">2. Nature of the Platform</h3>
        <p>
          The Platform is a digital material intelligence and sourcing
          marketplace. The Company provides tools that enable Buyers to search
          materials, compare specifications, review carbon indicators, manage
          projects, and communicate with Suppliers.
        </p>
        <p>
          The Company does not manufacture, sell, distribute, store, inspect, or
          deliver materials. The Company is not a party to any contract formed
          between a Buyer and a Supplier.
        </p>
        <p>
          All purchasing decisions, negotiations, contracts, logistics, and
          payments occur directly between Buyers and Suppliers.
        </p>

        <h3 className="font-bold">3. Account Registration</h3>
        <p>
          You agree to provide accurate, current, and complete information
          during registration and to maintain and update such information. You
          are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account.
        </p>
        <p>
          The Company reserves the right to suspend or terminate accounts
          containing false or misleading information.
        </p>

        <h3 className="font-bold">4. Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5">
          <li>Use the Platform for unlawful purposes</li>
          <li>Submit false sourcing requests</li>
          <li>Harass Suppliers or other users</li>
          <li>Attempt to bypass the Platform to avoid agreed service fees</li>
          <li>Interfere with the security or operation of the Platform</li>
          <li>Reverse engineer or copy proprietary systems</li>
        </ul>

        <h3 className="font-bold">5. Material and Carbon Data Disclaimer</h3>
        <p>
          Material specifications, pricing ranges, carbon indicators, and
          performance information are provided for comparison and early-stage
          decision support only.
        </p>
        <p>Carbon data provided by the Platform:</p>
        <ul className="list-disc pl-5">
          <li>Is based on available datasets and estimation models</li>
          <li>Is not a certified lifecycle assessment</li>
          <li>Is not a regulatory compliance certificate</li>
          <li>
            Must be independently verified before submission to certification
            bodies or regulators
          </li>
        </ul>
        <p>
          The Company makes no warranty regarding accuracy, completeness, or
          suitability for regulatory filings.
        </p>

        <h3 className="font-bold">
          6. Transactions, Liability, and Complaints
        </h3>
        <p>
          All transactions occur directly between Buyers and Suppliers. The
          Company is not a party to any agreement formed between them and does
          not guarantee product quality, compliance, delivery timelines, pricing
          accuracy, or supplier performance.
        </p>
        <p>
          The Company shall not be liable for material defects, delivery
          failures, supplier misconduct, project delays, cost overruns, business
          losses, or reliance on estimated carbon data. Buyers are responsible
          for conducting their own due diligence.
        </p>
        <p>
          Buyers may submit complaints regarding Supplier misrepresentation,
          non-delivery, or fraudulent conduct. The Company reserves the right to
          review complaints and, where appropriate, suspend, restrict, or
          permanently remove Suppliers from the Platform. Such enforcement
          actions do not create liability for the underlying transaction.
        </p>

        <h3 className="font-bold">7. Data Retention and Access</h3>
        <p>
          Project data and associated information may be retained for up to five
          (5) years following account inactivity, subscription expiration, or
          downgrade.
        </p>
        <p>
          If your subscription lapses, access to stored project data,
          downloadable reports, and advanced tools may be restricted.
        </p>
        <p>
          To regain access to archived project data or export stored
          information, you may be required to activate an active subscription
          plan.
        </p>
        <p>
          After five (5) years of inactivity, the Company may permanently delete
          stored data without liability.
        </p>

        <h3 className="font-bold">8. Intellectual Property</h3>
        <p>
          All Platform software, systems, databases, analytics tools, and
          underlying methodologies are the exclusive property of the Company.
        </p>
        <p>
          You retain ownership of any original content you upload but grant the
          Company a non-exclusive license to store, display, and process such
          content for Platform operation.
        </p>

        <h3 className="font-bold">9. Privacy and Data Use</h3>
        <p>
          The Company may collect and process user data including contact
          information, project metadata, usage behavior, and communication logs
          for purposes including platform optimization, fraud prevention,
          analytics, and regulatory compliance.
        </p>
        <p>
          The Company does not sell personal data. Data may be disclosed where
          required by law or court order.
        </p>

        <h3 className="font-bold">10. Suspension and Termination</h3>
        <p>
          The Company may suspend or terminate your account for violation of
          this Agreement, fraudulent activity, abuse of the sourcing system, or
          non-compliance with applicable laws.
        </p>
        <p>
          Termination does not release you from obligations incurred prior to
          termination.
        </p>

        <h3 className="font-bold">11. Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by law, the Company’s liability shall
          be limited to the amount paid by you to the Platform in the twelve
          (12) months preceding any claim.
        </p>
        <p>
          The Company shall not be liable for indirect, incidental, special, or
          consequential damages.
        </p>

        <h3 className="font-bold">12. Governing Law and Dispute Resolution</h3>
        <p>
          This Agreement shall be governed by the laws of the Republic of
          Rwanda. Any dispute shall first be attempted through good-faith
          negotiation. Failing resolution, disputes shall be submitted to
          competent courts in Rwanda.
        </p>

        <h3 className="font-bold">13. Amendments</h3>
        <p>
          The Company may amend this Agreement at any time. Continued use of the
          Platform constitutes acceptance of updated terms.
        </p>

        <h3 className="font-bold">14. Acceptance</h3>
        <p>
          By creating an account, accessing the Platform, or clicking “I Agree,”
          you confirm that you have read, understood, and agree to be legally
          bound by this Agreement.
        </p>
      </div>
    ) : (
      <div className="space-y-4 text-sm">
        <p>Effective Date: {new Date().toLocaleDateString()}</p>
        <p>
          This Supplier User Agreement (“Agreement”) governs your registration,
          listing, and participation as a Supplier on the Carbon Smart Spaces
          platform (“Platform”), operated by KINE MODU. By registering as a
          Supplier, uploading materials, or subscribing to any Supplier plan,
          you agree to be legally bound by this Agreement.
        </p>

        <h3 className="font-bold">1. Definitions</h3>
        <p>
          “Supplier” means any legally registered business listing materials,
          products, or services on the Platform.
        </p>
        <p>
          “Buyer” means any individual or entity accessing the Platform to
          search, compare, evaluate, or source materials from Suppliers.
        </p>
        <p>
          “Content” includes product listings, pricing information, technical
          specifications, certifications, carbon data, and uploaded
          documentation.
        </p>

        <h3 className="font-bold">2. Supplier Eligibility and Verification</h3>
        <p>
          Suppliers must submit valid business registration documentation and
          any additional verification requested by the Company.
        </p>
        <p>
          Approval is subject to review. The Company reserves the right to
          reject, suspend, or revoke Supplier status at its sole discretion.
        </p>

        <h3 className="font-bold">3. Nature of the Platform</h3>
        <p>
          The Platform provides digital visibility, listing tools, sourcing
          request participation, and communication functionality.
        </p>
        <p>The Company does not:</p>
        <ul className="list-disc pl-5">
          <li>Own listed materials</li>
          <li>Store products</li>
          <li>Provide logistics</li>
          <li>Guarantee payment</li>
          <li>Act as agent for either party</li>
        </ul>
        <p>
          All sales contracts are formed directly between Suppliers and
          Professional Buyers.
        </p>

        <h3 className="font-bold">
          4. Supplier Representations and Warranties
        </h3>
        <p>You represent and warrant that:</p>
        <ul className="list-disc pl-5">
          <li>All information submitted is accurate and truthful</li>
          <li>You have legal authority to list and sell materials</li>
          <li>All certifications and sustainability claims are authentic</li>
          <li>Pricing information is not intentionally misleading</li>
          <li>Uploaded content does not infringe third-party rights</li>
        </ul>
        <p>
          False representations may result in immediate suspension or
          termination.
        </p>

        <h3 className="font-bold">5. Carbon and Sustainability Claims</h3>
        <p>
          Any carbon claims, environmental performance statements, or
          sustainability labels provided by Suppliers must be truthful and
          supported by documentation where applicable.
        </p>
        <p>
          The Company may remove or flag claims that cannot be substantiated.
        </p>

        <h3 className="font-bold">6. Complaints and Compliance</h3>
        <p>
          Users may submit complaints regarding misrepresentation, non-delivery,
          fraud, or misconduct.
        </p>
        <p>Upon receiving a complaint, the Company may:</p>
        <ul className="list-disc pl-5">
          <li>Request supporting documentation</li>
          <li>Temporarily suspend listings</li>
          <li>Remove product visibility</li>
          <li>Investigate communications</li>
        </ul>
        <p>
          If multiple verified complaints are received or deceitful conduct is
          confirmed, the Company may permanently ban the Supplier without
          refund.
        </p>

        <h3 className="font-bold">7. Platform Conduct</h3>
        <p>Suppliers agree not to:</p>
        <ul className="list-disc pl-5">
          <li>Submit false bids</li>
          <li>Manipulate bidding credits</li>
          <li>Circumvent the Platform to avoid fees</li>
          <li>Engage in deceptive pricing practices</li>
          <li>Upload misleading product images</li>
          <li>Harass or pressure Buyers</li>
        </ul>

        <h3 className="font-bold">8. Fees and Payment</h3>
        <p>
          Subscription and service fees are due in advance and are
          non-refundable unless required by law.
        </p>
        <p>Failure to pay may result in suspension.</p>

        <h3 className="font-bold">9. Intellectual Property</h3>
        <p>
          Suppliers retain ownership of uploaded materials and brand assets but
          grant the Company a non-exclusive license to display, promote, and
          process such content for Platform operation and marketing.
        </p>

        <h3 className="font-bold">10. Limitation of Liability</h3>
        <p>The Company shall not be liable for:</p>
        <ul className="list-disc pl-5">
          <li>Non-payment by Buyers</li>
          <li>Contract disputes</li>
          <li>Delivery failures</li>
          <li>Business losses</li>
          <li>Indirect or consequential damages</li>
        </ul>
        <p>
          The Platform is provided “as is” without warranties of merchantability
          or fitness for a particular purpose.
        </p>

        <h3 className="font-bold">11. Termination</h3>
        <p>The Company may suspend or terminate Supplier accounts for:</p>
        <ul className="list-disc pl-5">
          <li>Fraud</li>
          <li>Repeated verified complaints</li>
          <li>Submission of false documentation</li>
          <li>Violation of this Agreement</li>
          <li>Non-compliance with applicable laws</li>
        </ul>
        <p>
          Termination may include removal of listings and loss of visibility.
        </p>

        <h3 className="font-bold">12. Governing Law and Dispute Resolution</h3>
        <p>
          This Agreement is governed by the laws of the Republic of Rwanda.
          Disputes shall first attempt mediation, failing which courts of
          competent jurisdiction in Rwanda shall have authority.
        </p>

        <h3 className="font-bold">13. Amendments</h3>
        <p>
          The Company may update this Agreement. Continued participation
          constitutes acceptance of modifications.
        </p>

        <h3 className="font-bold">14. Acceptance</h3>
        <p>
          By registering as a Supplier, uploading listings, subscribing to a
          plan, or clicking “I Agree,” you confirm that you have read,
          understood, and agree to be legally bound by this Agreement.
        </p>
      </div>
    );

  return (
    <div className="flex items-center space-x-2 justify-start">
      <input
        type="checkbox"
        id="terms"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the{" "}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="text-primary hover:underline font-bold"
                type="button"
              >
                User Agreement
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  Please read the agreement carefully.
                </DialogDescription>
              </DialogHeader>
              <div className="h-[60vh] pr-4 border rounded-md p-4 bg-muted/20 overflow-y-auto">
                {content}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    onCheckedChange(true);
                    setOpen(false);
                  }}
                >
                  I Agree
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Label>
      </div>
    </div>
  );
}
