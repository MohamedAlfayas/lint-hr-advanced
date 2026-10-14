import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  addRole,
  editRole,
} from "../../redux/reducers/ChildReducer/RoleReducer";
import { toggleRSBView } from "../../redux/reducers/ChildReducer/RightSideBarReducer";
import { PostApi } from "../../common/api/PostApi";
import { default_roles_list } from "../../common/constant/RoleConstants";
import SidebarFormLayout from "../../shared/ui/SidebarFormLayout";
import { FormSection, FormTextField } from "../../shared/ui/form";
import { testId, itemTestKey } from "../../shared/testing/testId";

const schema = Yup.object({
  name: Yup.string().trim().required("Please Enter Role Name"),
  description: Yup.string(),
});

const toFormValues = (obj) => ({
  name: obj?.name ?? "",
  description: obj?.description ?? "",
  roles_list: obj?.roles_list ?? [],
});

const TOTAL_PERMISSIONS = default_roles_list.reduce(
  (sum, group) => sum + (group.permission?.length || 0),
  0,
);

// Adds `perm` plus every permission it depends on.
const addWithDependencies = (list, perm) => {
  const next = list.includes(perm?.role_uuid) ? [...list] : [...list, perm?.role_uuid];
  (perm?.dependency_to_element_list || []).forEach((element) => {
    default_roles_list.forEach((group) => {
      const dep = (group.permission || []).find((r) => r.element === element);
      if (dep && !next.includes(dep.role_uuid)) next.push(dep.role_uuid);
    });
  });
  return next;
};

const isRequiredBy = (perm, list) =>
  (perm?.dependency_for_uuid_list || []).some((d) => list.includes(d));

const RoleForm = () => {
  const dispatch = useDispatch();
  const { form_obj } = useSelector((state) => state.RightSideBarReducer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGroup, setActiveGroup] = useState(default_roles_list[0]?.id);
  const [search, setSearch] = useState("");

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(form_obj),
  });

  useEffect(() => {
    reset(toFormValues(form_obj));
  }, [form_obj, reset]);

  const watchedRoles = useWatch({ control, name: "roles_list" });
  const rolesList = useMemo(() => watchedRoles || [], [watchedRoles]);
  const isAdmin = form_obj?.is_admin === true;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return default_roles_list
      .map((group) => ({
        ...group,
        visible: q
          ? (group.permission || []).filter(
              (p) =>
                (p.notes || "").toLowerCase().includes(q) ||
                (group.name || "").toLowerCase().includes(q),
            )
          : group.permission || [],
      }))
      .filter((group) => group.visible.length > 0);
  }, [search]);

  const countFor = (group) =>
    isAdmin
      ? group.permission.length
      : group.permission.filter((p) => rolesList.includes(String(p.role_uuid)))
          .length;

  const totalSelected = isAdmin
    ? TOTAL_PERMISSIONS
    : default_roles_list.reduce((sum, g) => sum + countFor(g), 0);

  const updateRoles = (next) =>
    setValue("roles_list", next, { shouldDirty: true });

  const handleToggle = (checked, perm) => {
    if (checked) updateRoles(addWithDependencies(rolesList, perm));
    else updateRoles(rolesList.filter((d) => d !== perm.role_uuid));
  };

  const selectAllInGroup = (group) => {
    updateRoles(
      (group.permission || []).reduce(
        (list, perm) => addWithDependencies(list, perm),
        rolesList,
      ),
    );
  };

  const clearGroup = (group) => {
    const groupUuids = (group.permission || []).map((p) => p.role_uuid);
    const remaining = rolesList.filter((d) => !groupUuids.includes(d));
    // Keep group permissions that selected permissions elsewhere still depend on.
    const stillRequired = (group.permission || [])
      .filter((p) => isRequiredBy(p, remaining))
      .map((p) => p.role_uuid);
    updateRoles([...remaining, ...stillRequired]);
  };

  const scrollToGroup = (groupId) => {
    setActiveGroup(groupId);
    document
      .getElementById(`perm-group-${groupId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (values) => {
    if ((values.roles_list || []).length === 0) {
      toast.error("Select Atleast One Permissions");
      return;
    }
    setIsSubmitting(true);
    const res = await PostApi(
      "/role/create-role/",
      { ...form_obj, ...values },
      false,
    );
    setIsSubmitting(false);
    if (res.status && res.status === 200) {
      form_obj?.id === 0
        ? dispatch(addRole(res?.data.data))
        : dispatch(editRole(res?.data?.data));
      dispatch(toggleRSBView(false));
      toast.success(res?.data?.message);
    } else {
      toast.error(res?.data?.message || res?.data?.detail);
    }
  };

  const overallPct = TOTAL_PERMISSIONS
    ? Math.round((totalSelected / TOTAL_PERMISSIONS) * 100)
    : 0;

  return (
    <SidebarFormLayout
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={form_obj?.id ? "Update" : "Create"}
    >
      <FormSection title="Details">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="name"
              control={control}
              label="Role name"
              placeholder="Enter Role"
              required
              autoFocus
              fullWidth
              startIcon={<BadgeOutlinedIcon fontSize="small" color="action" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="description"
              control={control}
              label="Description"
              placeholder="Enter Description"
              fullWidth
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Permissions">
        {/* Summary */}
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.success.main, 0.05)})`,
          })}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={(theme) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                  boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                })}
              >
                <ShieldOutlinedIcon />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="baseline" spacing={0.75}>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                    {totalSelected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {TOTAL_PERMISSIONS} permissions selected
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={overallPct}
                  color={overallPct > 0 ? "success" : "inherit"}
                  sx={{ mt: 0.75, height: 6, borderRadius: 3, maxWidth: 320 }}
                />
              </Box>
            </Stack>
            <TextField
              size="small"
              placeholder="Search permissions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 240 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Paper>

        {isAdmin ? (
          <Alert severity="info" icon={<LockOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2 }}>
            The admin role always has every permission. These can't be changed.
          </Alert>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Permissions that others depend on are selected automatically and marked
            &nbsp;<b>Required</b>.
          </Typography>
        )}

        <Grid container spacing={2} alignItems="flex-start">
          {/* Module nav */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ position: { md: "sticky" }, top: { md: 0 } }}>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <Stack spacing={0.5}>
                {default_roles_list.map((group) => {
                  const count = countFor(group);
                  const total = group.permission.length;
                  const active = activeGroup === group.id;
                  return (
                    <Box
                      key={group.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => scrollToGroup(group.id)}
                      onKeyDown={(e) => e.key === "Enter" && scrollToGroup(group.id)}
                      sx={(theme) => ({
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                      })}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography
                          variant="body2"
                          fontWeight={active ? 700 : 500}
                          color={active ? "primary.main" : "text.primary"}
                          noWrap
                        >
                          {group.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color={count > 0 ? "success.main" : "text.secondary"}
                          sx={{ flexShrink: 0 }}
                        >
                          {count}/{total}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={total ? (count / total) * 100 : 0}
                        color={count === total ? "success" : "primary"}
                        sx={{ mt: 0.75, height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* Permission groups */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {groups.length === 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
                  <SearchRoundedIcon color="disabled" sx={{ fontSize: 36 }} />
                  <Typography variant="body2" color="text.secondary">
                    No permissions match "{search}".
                  </Typography>
                </Paper>
              )}

              {groups.map((group) => {
                const count = countFor(group);
                const total = group.permission.length;
                const allSelected = count === total;
                return (
                  <Paper
                    key={group.id}
                    id={`perm-group-${group.id}`}
                    variant="outlined"
                    sx={{ borderRadius: 3, overflow: "hidden", scrollMarginTop: 12 }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={(theme) => ({
                        px: 2,
                        py: 1.25,
                        borderBottom: 1,
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.text.primary, 0.02),
                      })}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {group.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${count}/${total}`}
                          color={count > 0 ? "success" : "default"}
                          variant={count > 0 ? "filled" : "outlined"}
                          sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                        />
                      </Stack>
                      {!isAdmin && (
                        <Button
                          data-testid={testId("role-clear", itemTestKey(group), "button")}
                          size="small"
                          onClick={() =>
                            allSelected ? clearGroup(group) : selectAllInGroup(group)
                          }
                          sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
                        >
                          {allSelected ? "Clear" : "Select all"}
                        </Button>
                      )}
                    </Stack>

                    <Box
                      sx={{
                        p: 1,
                        display: "grid",
                        gap: 0.75,
                        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                      }}
                    >
                      {group.visible.map((perm) => {
                        const checked = isAdmin || rolesList.includes(perm?.role_uuid);
                        const required = !isAdmin && isRequiredBy(perm, rolesList);
                        const disabled = isAdmin || required;
                        return (
                          <Box
                            key={perm.id}
                            id={`permission_${group.id}_${perm.id}`}
                            onClick={() => !disabled && handleToggle(!checked, perm)}
                            sx={(theme) => ({
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pl: 1.5,
                              pr: 0.5,
                              py: 0.5,
                              borderRadius: 2,
                              border: 1,
                              borderColor: checked
                                ? alpha(theme.palette.success.main, 0.35)
                                : "divider",
                              bgcolor: checked
                                ? alpha(theme.palette.success.main, 0.06)
                                : "transparent",
                              cursor: disabled ? "default" : "pointer",
                              transition: "all .15s ease",
                              "&:hover": disabled
                                ? undefined
                                : { borderColor: alpha(theme.palette.primary.main, 0.45) },
                            })}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: 13,
                                fontWeight: checked ? 600 : 400,
                                color: checked ? "text.primary" : "text.secondary",
                              }}
                            >
                              {perm.notes}
                            </Typography>
                            {required && (
                              <Tooltip title="Another selected permission depends on this one">
                                <Chip
                                  size="small"
                                  label="Required"
                                  icon={<LockOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                  sx={{ height: 20, fontSize: 10.5, fontWeight: 600 }}
                                />
                              </Tooltip>
                            )}
                            <Switch
                              size="small"
                              color="success"
                              checked={checked}
                              disabled={disabled}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleToggle(e.target.checked, perm)}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      </FormSection>
    </SidebarFormLayout>
  );
};

export default RoleForm;
