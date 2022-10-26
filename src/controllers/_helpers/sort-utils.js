export const sortByField = (arr, field, order) => {
  const compareFn =
    order == "asc"
      ? (a, b) => a[field] - b[field]
      : (a, b) => b[field] - a[field];

  return arr.map((x) => x).sort(compareFn);
};

export const sortByRelevance = (arr, fields, searchText, order) => {
  const queryAsLower = searchText.toLowerCase();
  const compareFn =
    order == "asc"
      ? (a, b) => a["value"] - b["value"]
      : (a, b) => b["value"] - a["value"];
  return arr
    .map((entry) => {
      let value = 0;
      for (let i = 0; i < fields.length; i++) {
        // console.log(entry?.[fields[i]]);
        if (entry[fields[i]]?.toLowerCase().includes(queryAsLower)) {
          value += fields.length - i;
        } else {
          console.log(entry["title"], " does not include the keyword");
        }
      }
      return { ...entry, value };
    })
    .sort(compareFn);
};
