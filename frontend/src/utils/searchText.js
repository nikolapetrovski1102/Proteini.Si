/** Lower-case and strip accents so "nano" matches "NÄNO" and "proteine" matches "proteinë". */
export const searchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
