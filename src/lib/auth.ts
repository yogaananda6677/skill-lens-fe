export type AuthRole = "superadmin" | "admin" | "admin_sekolah" | "guru" | "siswa";

export type StoredUser = {
  id: number;
  nama: string;
  email?: string;
  username: string;
  role: AuthRole;
  id_sekolah?: number | null;
  must_change_password?: boolean;
};

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("skilllens_token") || window.localStorage.getItem("token") || window.localStorage.getItem("access_token");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("skilllens_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function persistAuth(token: string, user: StoredUser, rememberDevice = false) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("skilllens_token", token);
  window.localStorage.setItem("skilllens_user", JSON.stringify(user));
  if (rememberDevice) window.localStorage.setItem("skilllens_remember", "true");
  else window.localStorage.removeItem("skilllens_remember");
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("skilllens_token");
  window.localStorage.removeItem("skilllens_user");
  window.localStorage.removeItem("skilllens_remember");
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("access_token");
}

export function redirectPathByRole(role?: string | null) {
  if (role === "superadmin") return "/superadmin/admin";
  if (role === "admin") return "/admin/dashboard";
  if (role === "admin_sekolah") return "/admin-sekolah";
  if (role === "guru") return "/guru";
  if (role === "siswa") return "/siswa";
  return "/auth/login";
}
