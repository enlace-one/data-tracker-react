import { ReactElement } from "react";
import type { Schema } from "../amplify/data/resource";

// Change to use these types: useState<Schema["DataType"]["type"]>([]);
// But I want to be able to refernece it like import Types from types; Types.UserProfile

// export interface UserProfile as Schema["UserProfile"]["type"]

export type UserProfile = Schema["UserProfile"]["type"];
export type DataType = {
  name: string;
  note: string;
  isComplex: boolean;
  inputType: string;
  id: string;
  pattern?: string;
};
export type DataCategory = Schema["DataCategory"]["type"];
export type DataEntry = Schema["DataEntry"]["type"];
export type Macro = Schema["Macro"]["type"];
export type Topic = { name: string; imageLink: string };

// export interface DataType {
//   id: string;
//   name: string;
//   note?: string;
//   isComplex: boolean;
//   dataEntries: DataCategory[];
// }

// export interface DataCategory {
//   id: string;
//   name: string;
//   note?: string;
//   addDefault: boolean;
//   defaultValue?: string;
//   options?: string[]; // Future use with value options
//   dataEntries: DataEntry[];
//   dataType: DataType;
//   dataTypeId: string;
// }

// export interface DataEntry {
//   id: string;
//   note?: string;
//   category: DataCategory;
//   dataCategoryId: string;
//   date: string; // Assuming ISO string format for dates
//   value: string;
// }

export interface FormDataType {
  name?: string;
  note?: string;
  isComplex?: boolean;
  defaultValue?: string;
  addDefault?: boolean;
  useLastEntryAsDefaultValue?: boolean;
  dataTypeId?: string;
  dataCategoryId?: string;
  inputType?: string;
  date?: string;
  value?: string;
  id?: string;
  pattern?: string;
  negativeIncrement?: string;
  positiveIncrement?: string;
  formula?: string;
  schedule?: string;
  priority?: number;
  lastRunDate?: string;
  options?: string;
  lastRunOutput?: string;
  imageLink?: string;
  topicId?: string;
  email?: string;
  isNew?: boolean;
  topicColorPreference?: string;
  categorySortPreference?: string;
  customCategoryOrder?: string[];
}

export type ResolvedDataType = DataType;

export type ResolvedTopic = Topic;

export type EnrichedDataCategory = Schema["DataCategory"]["type"] & {
  dataType: ResolvedDataType;
} & {
  topic: ResolvedTopic;
};

export type ResolvedDataCategory = Omit<
  Schema["DataCategory"]["type"],
  "dataEntries"
> & {
  dataEntries?: Schema["DataEntry"]["type"][];
};

export type _EnrichedDataEntry = Omit<
  Schema["DataEntry"]["type"],
  "dataCategory"
> & {
  dataCategory: ResolvedDataCategory;
};

export type EnrichedDataEntry = Omit<
  Schema["DataEntry"]["type"],
  "dataCategory"
> & {
  dataCategory: EnrichedDataCategory; // This already includes ResolvedDataType
};

export type DataPoint = {
  name: string;
  value: number;
  displayValue: string;
  note: string;
};

export type FlexFormOption = {
  label: string;
  value: string;
  element?: ReactElement;
};

export type FlexFormField = {
  id: string;
  name: string;
  hidden?: boolean;
  required?: boolean;
  type?: string; // e.g. "text", "checkbox", "select", etc.
  options?: FlexFormOption[]; // Only needed for select fields
  default?: string | boolean | null; // Default value for the field
  note?: string | null;
  pattern?: string | null;
};

export type ActiveTab =
  | "macros"
  | "profile"
  | "categories"
  | "entries"
  | "types"
  | "graph"
  | "date-graph"
  | "text-graph"
  | "heat-map-graph"
  | "calendar"
  | "day";

export interface AlertInfo {
  message: string;
  type: "" | "success" | "error" | "warning" | "default";
}
export type SetActionMessageFunction = (
  alertInfo: AlertInfo,
  timeout?: number
) => void;

export type ValueHandling =
  | "text"
  | "output"
  | "value 1"
  | "value 2"
  | "value 3";

export type ZeroHandling = "default" | "treat-as-blank";

export type BlankHandling = "skip" | "zeroize" | "default" | "previous";
