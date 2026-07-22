import type { Company, Contact, Tag, ContactStatus, CompanySize } from "./types";

const BASE_URL = "http://localhost:8081/api";

// ─── Types matching backend DTOs ────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CompanyResponse {
  id: string;
  name: string;
  website: string;
  linkedin: string;
  size: CompanySize;
  createdAt: string;
  contactCount: number;
}

export interface ContactResponse {
  id: string;
  name: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  email: string | null;
  linkedin: string;
  twitter: string | null;
  status: ContactStatus;
  createdAt: string;
  tagIds: string[];
}

export interface TagResponse {
  id: string;
  name: string;
}

export interface CompanyRequest {
  name: string;
  website: string;
  linkedin: string;
  size: CompanySize;
}

export interface ContactRequest {
  name: string;
  role: string;
  companyId: string | null;
  email: string | null;
  linkedin: string;
  twitter: string | null;
  status: ContactStatus;
  tagIds: string[];
}

export interface TagRequest {
  name: string;
}

// ─── Generic fetch helper ───────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? body?.message ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  // DELETE returns 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Company APIs ───────────────────────────────────────────────────────────

export function fetchCompanies(params?: {
  search?: string;
  page?: number;
  size?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.size != null) q.set("size", String(params.size));
  const qs = q.toString();
  return apiFetch<PagedResponse<CompanyResponse>>(
    `/companies${qs ? `?${qs}` : ""}`
  );
}

export function fetchCompany(id: string) {
  return apiFetch<CompanyResponse>(`/companies/${id}`);
}

export function createCompany(data: CompanyRequest) {
  return apiFetch<CompanyResponse>("/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCompany(id: string, data: CompanyRequest) {
  return apiFetch<CompanyResponse>(`/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCompany(id: string) {
  return apiFetch<void>(`/companies/${id}`, { method: "DELETE" });
}

// ─── Contact APIs ───────────────────────────────────────────────────────────

export function fetchContacts(params?: {
  search?: string;
  companyId?: string;
  role?: string;
  status?: ContactStatus;
  page?: number;
  size?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.companyId) q.set("companyId", params.companyId);
  if (params?.role) q.set("role", params.role);
  if (params?.status) q.set("status", params.status);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.size != null) q.set("size", String(params.size));
  const qs = q.toString();
  return apiFetch<PagedResponse<ContactResponse>>(
    `/contacts${qs ? `?${qs}` : ""}`
  );
}

export function fetchContact(id: string) {
  return apiFetch<ContactResponse>(`/contacts/${id}`);
}

export function fetchContactsByCompany(companyId: string) {
  return apiFetch<ContactResponse[]>(`/contacts/by-company/${companyId}`);
}

export function createContact(data: ContactRequest) {
  return apiFetch<ContactResponse>("/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateContact(id: string, data: ContactRequest) {
  return apiFetch<ContactResponse>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteContact(id: string) {
  return apiFetch<void>(`/contacts/${id}`, { method: "DELETE" });
}

// ─── Tag APIs ───────────────────────────────────────────────────────────────

export function fetchTags() {
  return apiFetch<TagResponse[]>("/tags");
}

export function createTag(data: TagRequest) {
  return apiFetch<TagResponse>("/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteTag(id: string) {
  return apiFetch<void>(`/tags/${id}`, { method: "DELETE" });
}

// ─── Outreach APIs ──────────────────────────────────────────────────────────

export interface OutreachRequest {
  contactId: string;
  platform: string;
  type: string;
  date: string;
  nextFollowupDate: string | null;
  referenceUrl: string | null;
}

export function fetchOutreachesByContact(contactId: string) {
  return apiFetch<import("./types").Outreach[]>(`/outreaches/by-contact/${contactId}`);
}

export function fetchOutreaches(params?: { page?: number; size?: number; hasFollowup?: boolean }) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.size != null) q.set("size", String(params.size));
  if (params?.hasFollowup != null) q.set("hasFollowup", String(params.hasFollowup));
  const qs = q.toString();
  return apiFetch<PagedResponse<import("./types").Outreach>>(`/outreaches${qs ? `?${qs}` : ""}`);
}

export function createOutreach(data: OutreachRequest) {
  return apiFetch<import("./types").Outreach>("/outreaches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateOutreach(id: string, data: OutreachRequest) {
  return apiFetch<import("./types").Outreach>(`/outreaches/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function completeOutreach(id: string) {
  return apiFetch<import("./types").Outreach>(`/outreaches/${id}/complete`, {
    method: "PUT",
  });
}

export function deleteOutreach(id: string) {
  return apiFetch<void>(`/outreaches/${id}`, { method: "DELETE" });
}
