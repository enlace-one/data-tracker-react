export interface UserProfile {
  id: string;
  email: string;
  profileOwner: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataType {
  id: string;
  name: string;
  note?: string;
  isComplex: boolean;
  dataEntries: DataCategory[];
}

export interface DataCategory {
  id: string;
  name: string;
  note?: string;
  addDefault: boolean;
  defaultValue?: string;
  options?: string[]; // Future use with value options
  dataEntries: DataEntry[];
  dataType: DataType;
  dataTypeId: string;
}

export interface DataEntry {
  id: string;
  note?: string;
  category: DataCategory;
  dataCategoryId: string;
  date: string; // Assuming ISO string format for dates
  value: string;
}

export interface FormDataType {
  name?: string;
  note?: string;
  isComplex?: boolean;
  defaultValue?: string;
  addDefault?: boolean;
  dataTypeId?: string;
  dataCategoryId?: string;
  date?: string;
  value?: string;
}
