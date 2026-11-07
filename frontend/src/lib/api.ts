import { World } from "../types/world";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function fetchPublicWorlds(): Promise<World[]> {
  const res = await fetch(apiUrl("/api/worlds"));
  if (!res.ok) {
    throw new Error(`Failed to fetch worlds (${res.status})`);
  }
  const data = await res.json();
  return data.worlds as World[];
}

export async function adminRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error ?? `Request failed (${res.status})`);
  return payload as T;
}

export async function fetchAdminWorlds(token: string) {
  return adminRequest<{ worlds: World[] }>("/api/admin/worlds", token);
}

export async function saveWorld(token: string, payload: Partial<World>, id?: string) {
  return adminRequest<{ world: World }>(id ? `/api/admin/worlds/${id}` : "/api/admin/worlds", token, {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeWorld(token: string, id: string) {
  return adminRequest<void>(`/api/admin/worlds/${id}`, token, { method: "DELETE" });
}

export async function uploadArtwork(token: string, slug: string, file: File) {
  const form = new FormData();
  form.append("slug", slug);
  form.append("artwork", file);
  return adminRequest<{ artworkUrl: string }>("/api/admin/worlds/artwork", token, {
    method: "POST",
    body: form,
  });
}
