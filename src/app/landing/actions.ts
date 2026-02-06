"use server";

import { db } from "@/db/client";
import { leads } from "@/db/new-schema";

export async function submitSupplierLeadAction(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  materialType: string;
  countryCity: string;
}) {
  await db.insert(leads).values({
    type: "supplier",
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    materialType: data.materialType,
    countryCity: data.countryCity,
  });
}

export async function submitPartnershipLeadAction(data: {
  orgName: string;
  contactName: string;
  email: string;
  partnershipType: string;
  message?: string;
}) {
  await db.insert(leads).values({
    type: "partnership",
    companyName: data.orgName,
    contactName: data.contactName,
    email: data.email,
    partnershipType: data.partnershipType,
    message: data.message,
  });
}
