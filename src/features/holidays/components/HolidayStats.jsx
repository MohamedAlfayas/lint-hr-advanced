import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import UpcomingOutlinedIcon from "@mui/icons-material/UpcomingOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import dayjs from "dayjs";

const StatCard = ({ label, value, hint, icon, color }) => (
  <Card sx={{ flex: "1 1 200px" }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: (t) => `${t.palette[color].main}1a`,
          color: `${color}.main`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {hint}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const HolidayStats = ({ holidays, year }) => {
  const today = dayjs();
  const upcoming = holidays
    .filter((h) => !dayjs(h.date).isBefore(today, "day"))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  const next = upcoming[0];
  const restricted = holidays.filter((h) => h.is_restricted).length;

  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2} sx={{ mb: 2.5 }}>
      <StatCard
        label={`Holidays in ${year}`}
        value={holidays.length}
        icon={<EventAvailableOutlinedIcon />}
        color="primary"
      />
      <StatCard
        label="Upcoming"
        value={upcoming.length}
        hint={next ? `Next: ${next.name} · ${dayjs(next.date).format("DD MMM")}` : "None left this year"}
        icon={<UpcomingOutlinedIcon />}
        color="success"
      />
      <StatCard
        label="Restricted"
        value={restricted}
        icon={<LockClockOutlinedIcon />}
        color="info"
      />
      <StatCard
        label="Non Restricted"
        value={holidays.length - restricted}
        icon={<BeachAccessOutlinedIcon />}
        color="warning"
      />
    </Stack>
  );
};

export default HolidayStats;
