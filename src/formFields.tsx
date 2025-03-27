import { DataEntry, FormDataType, EnrichedDataCategory } from "./types";

export const getAddEntryFormFieldsWithCategory = (
  category: EnrichedDataCategory
) => [
  // Category added in handleFormData
  {
    name: "Value",
    id: "value",
    type: category.dataType.inputType,
    note: category.note,
  },
  { name: "Date", id: "date", type: "date" },
  { name: "Note", id: "note" },
];

export const getUpdateEntryFormFieldsWithSetCategory = (
  entry: DataEntry,
  category: EnrichedDataCategory
) => [
  {
    name: "Value",
    id: "value",
    default: entry.value ?? "",
    type: category.dataType.inputType,
    note: category.note,
  },
  { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
  { name: "Note", id: "note", default: entry.note ?? "" },
  { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
];

export const getUpdateCategoryFormFields = (category: EnrichedDataCategory) => [
  { name: "Name", id: "name", required: true, default: category.name ?? "" },
  { name: "Note", id: "note", default: category.note ?? "" },
  {
    name: "Add Default",
    id: "addDefault",
    type: "boolean",
    default: category.addDefault ?? false,
  },
  {
    name: "Default Value",
    id: "defaultValue",
    type: category.dataType.inputType,
    default: category.defaultValue ?? "",
  },
];
