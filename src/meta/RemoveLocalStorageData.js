export const RemoveLocalStorageData = (key, id) => {
  const globalData = JSON.parse(
    localStorage.getItem("lint_hr_globaldata") || "{}",
  );

  if (!globalData[key]) return;

  globalData[key] = globalData[key].filter(
    (item) => Number(item.id) !== Number(id),
  );

  localStorage.setItem("lint_hr_globaldata", JSON.stringify(globalData));
};
