const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("skilllens_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Terjadi kesalahan pada server");
  }

  return data;
}

export type AdminUser = {
  id_user: number;
  nama: string;
  email: string;
  username: string;
  no_hp: string | null;
  role: "admin";
};

export type AdminPayload = {
  nama: string;
  email: string;
  username: string;
  no_hp?: string;
  password?: string;
};

export function getAdmins(): Promise<AdminUser[]> {
  return request("/superadmin/admin");
}

export function createAdmin(payload: Required<AdminPayload>) {
  return request("/superadmin/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdmin(id: number, payload: AdminPayload) {
  return request(`/superadmin/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdmin(id: number) {
  return request(`/superadmin/admin/${id}`, {
    method: "DELETE",
  });
}