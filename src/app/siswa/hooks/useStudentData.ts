"use client";

import { useEffect, useState } from "react";
import {
  getSiswaMe,
  normalizeStudentAchievements,
  toStudentProfile,
} from "../../../features/siswa/api";
import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";

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

export function useStudentData() {
  const [profile, setProfile] = useState<StudentProfileForm>(emptyProfile);
  const [prestasiRows, setPrestasiRows] = useState<StudentAchievement[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  async function loadStudent() {
    setLoadingProfile(true);
    setError("");

    try {
      const data = await getSiswaMe();
      setProfile(toStudentProfile(data));
      setPrestasiRows(normalizeStudentAchievements(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data siswa.",
      );
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    loadStudent();
  }, []);

  function updateProfile(patch: Partial<StudentProfileForm>) {
    setProfile((current) => ({ ...current, ...patch }));
  }

  return {
    profile,
    setProfile,
    prestasiRows,
    loadingProfile,
    error,
    setError,
    updateProfile,
    reloadStudent: loadStudent,
  };
}