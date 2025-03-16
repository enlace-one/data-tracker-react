import type { Schema } from "../amplify/data/resource";

// Change to use these types: useState<Schema["DataType"]["type"]>([]);
// But I want to be able to refernece it like import Types from types; Types.UserProfile

// export interface UserProfile as Schema["UserProfile"]["type"]

export type UserProfile = Schema["UserProfile"]["type"];
export type DataType = Schema["DataType"]["type"];
export type DataCategory = Schema["DataCategory"]["type"];
export type DataEntry = Schema["DataEntry"]["type"];

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
  dataTypeId?: string;
  dataCategoryId?: string;
  inputType?: string;
  date?: string;
  value?: string;
  id?: string;
}

export type ResolvedDataType = Omit<
  Schema["DataType"]["type"],
  "dataCategories"
> & {
  dataCategories?: Schema["DataCategory"]["type"][];
};

export type EnrichedDataCategory = Omit<
  Schema["DataCategory"]["type"],
  "dataType"
> & {
  dataType: ResolvedDataType;
};
