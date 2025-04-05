import {
  DataEntry,
  EnrichedDataCategory,
  DataType,
  FlexFormField,
  Macro,
  Topic,
} from "./types";

export const getAddEntryFormFieldsWithCategory = (
  category: EnrichedDataCategory
) => [
  // Category added in handleFormData
  {
    name: "Value",
    id: "value",
    type: category.dataType?.inputType ?? "text",
    note: `${category.note}. DataType is ${category.dataType?.name}: ${category.dataType?.note}`,
    default: category.defaultValue,
    pattern: category.dataType?.pattern ?? ".*",
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
    pattern: category.dataType?.pattern ?? ".*",
    note: `${category.note}. DataType is ${category.dataType?.name}: ${category.dataType?.note}`,
  },
  { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
  { name: "Note", id: "note", default: entry.note ?? "" },
  { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
];
export const getUpdateCategoryFormFields = (
  category: EnrichedDataCategory,
  showDataType: boolean = false,
  dataTypes: DataType[],
  topics: Topic[]
): FlexFormField[] => {
  const topicOptions = topics.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

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
      note: category.dataType?.note ?? "",
      type: category.dataType?.inputType ?? "text",
      pattern: category.dataType?.pattern ?? ".*",
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
    {
      name: "Topic",
      id: "topicId",
      type: "select",
      default: category.topicId,
      options: topicOptions,
      required: true,
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
      default: category.dataTypeId,
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
  }[]
) => [
  {
    name: "Data Type",
    id: "dataTypeId",
    type: "select",
    options: dataTypeOptions,
    required: true,
  },
];

export const getAddCategorySecondaryFormFields = async (
  formData: Record<string, any>,
  params: unknown
) => {
  const assertedParams = params as { dataTypes: DataType[]; topics: Topic[] };

  const dataTypes = assertedParams["dataTypes"];
  const topics = assertedParams["topics"];

  const dataTypeId = String(formData["dataTypeId"]); // Ensure string comparison
  const dataType = dataTypes.find((dt) => String(dt.id) === dataTypeId);

  const topicOptions = topics.map((dt) => ({
    label: dt.name,
    value: dt.id,
    child: (
      <img
        src={"/" + dt.imageLink}
        alt={dt.name}
        style={{
          width: "5rem",
          margin: "1rem",
          height: "5rem",
          padding: "2px",
          border: "1px solid #007bff",
          borderRadius: "50%",
        }}
      ></img>
    ),
  }));

  if (!dataType) {
    throw new Error(
      `No DataType Selected. Received: ${JSON.stringify(formData)}`
    );
  }

  let fields: FlexFormField[] = [
    { name: "Name", id: "name", required: true },
    { name: "Note", id: "note" },
    { name: "Add Default", id: "addDefault", type: "boolean" },
    {
      name: "Default Value",
      id: "defaultValue",
      pattern: dataType?.pattern ?? ".*",
      type: dataType.inputType,
      note: dataType.note,
    },
    {
      name: "Topic",
      id: "topicId",
      type: "select",
      options: topicOptions,
      required: true,
    },
  ];

  if (["time", "number"].includes(dataType.inputType)) {
    fields.push(
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
      }
    );
  }

  return fields;
};

export const getAddUpdateDataEntryFormFields = (
  entry: DataEntry,
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
      default: entry.dataCategoryId,
    },
  ];
};

// getAddDataEntrySecondaryFormFields

export const getAddUpdateDataEntrySecondaryFormFields = async (
  formData: Record<string, any>,
  params: unknown
) => {
  const assertedParams = params as {
    dataCategories: EnrichedDataCategory[];
    entry: DataEntry;
  };

  const dataCategories = assertedParams["dataCategories"];
  const entry = assertedParams["entry"];

  const dataCategoryId = String(formData["dataCategoryId"]); // Ensure string comparison
  const dataCategory = dataCategories.find(
    (dt) => String(dt.id) === dataCategoryId
  );

  if (!dataCategory) {
    throw new Error(
      `No dataCategory Selected. Received: ${JSON.stringify(formData)}`
    );
  }

  let fields: FlexFormField[] = [
    {
      name: "Value",
      id: "value",
      default: entry?.value ?? dataCategory.defaultValue,
      type: dataCategory.dataType.inputType,
      pattern: dataCategory.dataType?.pattern ?? ".*",
      note: `${dataCategory.note}. DataType is ${dataCategory.dataType?.name}: ${dataCategory.dataType?.note}`,
    },
    { name: "Date", id: "date", type: "date", default: entry?.date },
    { name: "Note", id: "note", default: entry?.note },
    { name: "Id", id: "id", default: entry?.id, hidden: true },
  ];

  console.log(
    "Returning Fields: ",
    fields,
    "For Entry:",
    entry,
    "and category:",
    dataCategory
  );

  return fields;
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

export const getUpdateDataTypeFormFields = (dataType: DataType) => [
  { name: "Name", id: "name", required: true, default: dataType?.name ?? "" },
  { name: "Note", id: "note", default: dataType?.note ?? "" },
  {
    name: "Is Complex",
    id: "isComplex",
    type: "checkbox",
    default: dataType.isComplex ?? "",
  },
  { name: "Regex Pattern", id: "pattern", default: dataType?.pattern ?? ".*" },
  { name: "Input Type", id: "inputType", default: dataType?.inputType ?? "" },
  { name: "Id", id: "id", default: dataType.id ?? "", hidden: true },
];

export const getNewDataTypeFormFields = () => [
  { name: "Name", id: "name", required: true },
  { name: "Note", id: "note" },
  { name: "Regex Pattern", id: "pattern", default: ".*" },
  { name: "Input Type", id: "inputType" },
  { name: "Is Complex", id: "isComplex", type: "checkbox" },
];

export const getAddUpdateMacroFormFields = (
  macro: Macro,
  dataCategories: EnrichedDataCategory[]
) => {
  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));
  return [
    {
      name: "Name",
      id: "name",
      type: "text",
      required: true,
      default: macro.name ?? "",
    },
    {
      name: "Note",
      id: "note",
      type: "text",
      default: macro.note ?? "",
    },
    {
      name: "Data Category to Set",
      id: "dataCategoryId",
      type: "select",
      default: macro.dataCategoryId ?? "",
      options: dataCategoryOptions,
      required: true,
    },
    {
      name: "Formula",
      id: "formula",
      type: "text",
      note: "Example: [Cat Name 1] - [Cat Name 2]",
      required: true,
      default: macro.formula ?? "",
    },
    {
      name: "Cron Schedule",
      id: "schedule",
      type: "text",
      note: "Every Sunday: * * * * * SUN",
      required: true,
      default: macro.schedule ?? "* * * * * *",
    },
    {
      name: "Priority",
      id: "priority",
      type: "number",
      note: "Priority 0 runs first, 1 second, etc.",
      required: true,
      default: String(macro.priority) ?? "3",
    },
    {
      name: "Last Run Date",
      id: "lastRunDate",
      type: "date",
      note: "Will run if today > lastRunDate",
      hidden: true,
      default: macro.lastRunDate,
    },
    {
      name: "Last Run Output",
      id: "lastRunOutput",
      type: "text",
      note: "",
      hidden: true,
      default: macro.lastRunOutput,
    },
    { name: "Id", id: "id", default: macro.id ?? "", hidden: true },
  ];
};
