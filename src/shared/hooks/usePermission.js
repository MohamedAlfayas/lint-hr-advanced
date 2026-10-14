import { useMemo } from "react";

const readProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("lint_hr_profile_data")) || null;
  } catch {
    return null;
  }
};

/**
 * Returns `{ isAdmin, can(accessKey) }` from the cached profile.
 * Admins are granted every permission, matching `CheckRoleAccess`.
 */
export const usePermission = () =>
  useMemo(() => {
    const profile = readProfile();
    const isAdmin = profile?.is_admin === true;
    const perms = profile?.permission_list || [];
    return {
      isAdmin,
      can: (accessKey) => isAdmin || perms.includes(accessKey),
    };
  }, []);
