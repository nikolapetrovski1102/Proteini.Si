import { inputClass } from "./AdminKit";

/** inputClass with a red ring when the field has an error. */
export const fieldClass = (invalid, extra = "") =>
  `${invalid ? inputClass.replace("ring-1 ring-black/[0.08]", "ring-2 ring-[#E3262F]") : inputClass} ${extra}`;
