import {
  DataEntry,
  FormDataType,
  EnrichedDataCategory,
  DataType,
  FlexFormField,
} from "./types";

export const getAddEntryFormFieldsWithCategory = (
  category: EnrichedDataCategory
) => [
  // Category added in handleFormData
  {
    name: "Value",
    id: "value",
    type: category.dataType?.inputType ?? "text",
    note: category.note,
    default: category.defaultValue ?? "",
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
    default: entry.value ?? category.defaultValue ?? "",
    type: category.dataType?.inputType ?? "text",
    note: category.note,
  },
  { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
  { name: "Note", id: "note", default: entry.note ?? "" },
  { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
];
export const getUpdateCategoryFormFields = (
  category: EnrichedDataCategory,
  showDataType: boolean = false,
  dataTypes: DataType[]
): FlexFormField[] => {
  let formData: FlexFormField[] = [
    { name: "Name", id: "name", required: true, default: category.name ?? "" },
    { name: "Note", id: "note", default: category.note ?? "" },
    {
      name: "Add Default",
      id: "addDefault",
      type: "boolean",
      default: String(category.addDefault ?? false), // Ensure boolean conversion
    },
    {
      name: "Default Value",
      id: "defaultValue",
      type: category.dataType?.inputType ?? "text",
      default: String(category.defaultValue ?? ""), // Ensure default values are strings
    },
    {
      name: "Positive Increment",
      id: "positiveIncrement",
      type: "number",
      default: String(category.positiveIncrement ?? 1), // Ensure numeric default
    },
    {
      name: "Negative Increment",
      id: "negativeIncrement",
      type: "number",
      default: String(category.negativeIncrement ?? 1), // Ensure numeric default
    },
  ];

  if (showDataType) {
    const dataTypeOptions = dataTypes.map((dt) => ({
      label: dt.name,
      value: dt.id,
    }));

    formData.push({
      name: "Data Type",
      id: "dataTypeId",
      type: "select",
      options: dataTypeOptions,
      required: true,
    });
  }

  return formData;
};

export const getAddCategoryFormFields = (
  dataTypeOptions: {
    label: string;
    value: string;
  }[],
  getType: (formData: Record<string, any>) => string
) => [
  { name: "Name", id: "name", required: true },
  {
    name: "Data Type",
    id: "dataTypeId",
    type: "select",
    options: dataTypeOptions,
    required: true,
  },
  { name: "Note", id: "note" },
  { name: "Add Default", id: "addDefault", type: "boolean" },
  { name: "Default Value", id: "defaultValue", getType: getType },
  {
    name: "Positive Increment",
    id: "positiveIncrement",
    type: "number",
    default: "1",
  },
  {
    name: "Negative Increment",
    id: "negativeIncrement",
    type: "number",
    default: "1",
  },
];

export const getUpdateEntryFormFields = (
  entry: DataEntry,
  dataCategories: EnrichedDataCategory[]
) => {
  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));
  const getType = (formData: FormDataType) => {
    const category = dataCategories.find(
      (dc) => dc.id === formData.dataCategoryId
    );
    if (category) {
      return category.dataType?.inputType;
    } else {
      return "text";
    }
  };

  const getNote = (formData: FormDataType) => {
    const category = dataCategories.find(
      (dc) => dc.id === formData.dataCategoryId
    );
    if (category) {
      return category.note || "";
    } else {
      return "";
    }
  };

  return [
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
      default: entry.dataCategoryId,
    },
    {
      name: "Value",
      id: "value",
      default: entry.value ?? "",
      getType: getType,
      getNote: getNote,
    },
    { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
    { name: "Note", id: "note", default: entry.note ?? "" },
    { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
  ];
};

export const getSelectCategoryFormFields = (
  dataCategories: EnrichedDataCategory[]
) => {
  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  return [
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
    },
  ];
};

export const getSelectDataTypeFormFields = (dataTypes: DataType[]) => {
  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  return [
    {
      name: "Data Type",
      id: "dataTypeId",
      type: "select",
      options: dataTypeOptions,
      required: true,
    },
  ];
};
