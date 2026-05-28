"use client";

import { useEffect, useState, type SetStateAction } from "react";
import {
  getSiswaMe,
  normalizeStudentAchievements,
  toStudentProfile,
  type SiswaMeResponse,
} from "../../../features/siswa/api";
import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";
import { getStoredToken, getStoredUser } from "../../../lib/auth";

const emptyProfile: StudentProfileForm = {
  name: "",
  nisn: "",
  school: "",
  className: "",
  major: "",
  academicScores: {},
  interests: [],
  hobbies: [],
  talents: [],
  experiences: [],
  achievements: "",
  goal: "kuliah",
  learningPreference: "",
  constraints: "",
};

const FIRST_PREPARING_SESSION_KEY = "skilllens_student_preparing_seen";
const MIN_FIRST_PREPARING_TIME = 800;

type LoadedStudent = {
  cacheKey: string;
  data: SiswaMeResponse;
  profile: StudentProfileForm;
  prestasiRows: StudentAchievement[];
};

let cachedStudent: LoadedStudent | null = null;
let pendingStudentRequest: Promise<LoadedStudent> | null = null;
let pendingStudentCacheKey = "";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getStudentCacheKey() {
  if (typeof window === "undefined") return "server";

  const user = getStoredUser();
  const token = getStoredToken();

  return [
    user?.id ?? "no-user",
    user?.role ?? "no-role",
    token ? token.slice(-24) : "no-token",
  ].join(":");
}

function getCachedStudentForCurrentUser() {
  const cacheKey = getStudentCacheKey();

  if (cachedStudent && cachedStudent.cacheKey !== cacheKey) {
    resetStudentDataCache();
    return null;
  }

  return cachedStudent;
}

function shouldUsePreparingDelay() {
  if (typeof window === "undefined") return false;
  const cacheKey = getStudentCacheKey();
  return window.sessionStorage.getItem(`${FIRST_PREPARING_SESSION_KEY}:${cacheKey}`) !== "true";
}

function markPreparingDelayUsed() {
  if (typeof window === "undefined") return;
  const cacheKey = getStudentCacheKey();
  window.sessionStorage.setItem(`${FIRST_PREPARING_SESSION_KEY}:${cacheKey}`, "true");
}

function getStoredMustChangePassword() {
  if (typeof window === "undefined") return false;
  return Boolean(getStoredUser()?.must_change_password);
}

function normalizeStudentResponse(data: SiswaMeResponse): SiswaMeResponse {
  const raw = data as any;
  const mustChangePassword =
    raw?.must_change_password ??
    raw?.mustChangePassword ??
    raw?.user?.must_change_password ??
    raw?.akun?.must_change_password ??
    getStoredMustChangePassword();

  return {
    ...data,
    must_change_password: Boolean(mustChangePassword),
  };
}

async function requestStudent(force = false) {
  const cacheKey = getStudentCacheKey();
  const cache = getCachedStudentForCurrentUser();

  if (!force && cache) return cache;
  if (!force && pendingStudentRequest && pendingStudentCacheKey === cacheKey) {
    return pendingStudentRequest;
  }

  pendingStudentCacheKey = cacheKey;
  pendingStudentRequest = getSiswaMe()
    .then((response) => {
      const data = normalizeStudentResponse(response);
      const loaded: LoadedStudent = {
        cacheKey,
        data,
        profile: toStudentProfile(data),
        prestasiRows: normalizeStudentAchievements(data),
      };

      cachedStudent = loaded;
      return loaded;
    })
    .finally(() => {
      pendingStudentRequest = null;
      pendingStudentCacheKey = "";
    });

  return pendingStudentRequest;
}

export function resetStudentDataCache() {
  cachedStudent = null;
  pendingStudentRequest = null;
  pendingStudentCacheKey = "";
}

export function useStudentData() {
  const [profile, setProfile] = useState<StudentProfileForm>(emptyProfile);
  const [studentData, setStudentData] = useState<SiswaMeResponse | null>(null);
  const [prestasiRows, setPrestasiRows] = useState<StudentAchievement[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  async function loadStudent(options?: { force?: boolean; showPreparing?: boolean }) {
    const force = Boolean(options?.force);
    const showPreparing = Boolean(options?.showPreparing);
    const startedAt = Date.now();
    const cache = getCachedStudentForCurrentUser();
    const useDelay = showPreparing && !cache && shouldUsePreparingDelay();

    if (!force && cache) {
      setStudentData(cache.data);
      setProfile(cache.profile);
      setPrestasiRows(cache.prestasiRows);
      setLoadingProfile(false);
      setError("");
      return cache;
    }

    setStudentData(null);
    setProfile(emptyProfile);
    setPrestasiRows([]);
    setLoadingProfile(true);
    setError("");

    try {
      const loaded = await requestStudent(force);
      if (loaded.cacheKey !== getStudentCacheKey()) return null;

      setStudentData(loaded.data);
      setProfile(loaded.profile);
      setPrestasiRows(loaded.prestasiRows);
      return loaded;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data siswa.",
      );
      return null;
    } finally {
      if (useDelay) {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_FIRST_PREPARING_TIME - elapsed);

        if (remaining > 0) {
          await wait(remaining);
        }

        markPreparingDelayUsed();
      }

      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function init() {
      const loaded = await loadStudent({ showPreparing: true });
      if (!active || !loaded) return;
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  function updateProfile(patch: Partial<StudentProfileForm>) {
    setProfile((current) => {
      const next = { ...current, ...patch };
      const cache = getCachedStudentForCurrentUser();

      if (cache) {
        cachedStudent = { ...cache, profile: next };
      }

      return next;
    });
  }

  function markPasswordChanged() {
    setStudentData((current) => {
      const next = current ? { ...current, must_change_password: false } : current;
      const cache = getCachedStudentForCurrentUser();

      if (cache && next) {
        cachedStudent = { ...cache, data: next };
      }

      return next;
    });
  }

  return {
    profile,
    setProfile: (value: SetStateAction<StudentProfileForm>) => {
      setProfile((current) => {
        const next = typeof value === "function" ? value(current) : value;
        const cache = getCachedStudentForCurrentUser();

        if (cache) {
          cachedStudent = { ...cache, profile: next };
        }

        return next;
      });
    },
    studentData,
    mustChangePassword: Boolean(
      studentData?.must_change_password ?? getStoredMustChangePassword(),
    ),
    prestasiRows,
    loadingProfile,
    error,
    setError,
    updateProfile,
    markPasswordChanged,
    reloadStudent: () => loadStudent({ force: true, showPreparing: false }),
  };
}
