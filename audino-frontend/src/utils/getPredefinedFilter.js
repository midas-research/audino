export function getPredefinedFilter(user, predefinedFilterValues) {
  let result = null;
  if (user && predefinedFilterValues) {
    result = {};
    for (const key of Object.keys(predefinedFilterValues)) {
      result[key] = predefinedFilterValues[key].replace(
        "<username>",
        `${user.username}`
      );
    }
  }

  return result;
}
