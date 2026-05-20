import { apiFetch } from "../../lib/axios";

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
  return apiFetch<AdminUser[]>("/superadmin/admin");
}

export function createAdmin(payload: Required<AdminPayload>) {
  return apiFetch("/superadmin/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdmin(id: number, payload: AdminPayload) {
  return apiFetch(`/superadmin/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdmin(id: number) {
  return apiFetch(`/superadmin/admin/${id}`, {
    method: "DELETE",
  });
}
