export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export type ContactStatus =
  | "new"
  | "contacted"
  | "in_conversation"
  | "waiting"
  | "closed";

export const CONTACT_STATUSES: ContactStatus[] = [
  "new",
  "contacted",
  "in_conversation",
  "waiting",
  "closed",
];

export const COMPANY_SIZES: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

export interface Company {
  id: string;
  name: string;
  website: string;
  linkedin: string;
  size: CompanySize;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Contact {
  id: string;
  company_id: string | null;
  name: string;
  role: string;
  email: string | null;
  linkedin: string;
  twitter: string | null;
  status: ContactStatus;
  created_at: string;
  tag_ids: string[];
}

export type OutreachPlatform = "Email" | "LinkedIn" | "Twitter" | "Phone";
export type OutreachType =
  | "Cold Email"
  | "Follow-up Email"
  | "LinkedIn Request"
  | "LinkedIn Message"
  | "Twitter DM"
  | "Referral Request";

export const OUTREACH_PLATFORMS: OutreachPlatform[] = ["Email", "LinkedIn", "Twitter", "Phone"];
export const OUTREACH_TYPES: OutreachType[] = [
  "Cold Email",
  "Follow-up Email",
  "LinkedIn Request",
  "LinkedIn Message",
  "Twitter DM",
  "Referral Request",
];

export interface Outreach {
  id: string;
  contactId: string;
  contactName?: string;
  companyName?: string | null;
  platform: OutreachPlatform;
  type: OutreachType;
  date: string;
  nextFollowupDate: string | null;
  followupCompleted: boolean;
  referenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
