import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchUserProfiles,
  createDataCategory,
  subscribeToDataCategories,
  subscribeToDataEntries,
  fetchDataTypes,
  createUniqueDataType,
} from "./api";

import { UserProfile, DataCategory, DataEntry, DataType } from "./types"; // ✅ Import interfaces

// Define the context value type
interface DataContextType {
  userProfiles: UserProfile[];
  dataCategories: DataCategory[];
  dataEntries: DataEntry[];
  dataTypes: DataType[];
  makeDataCategory: () => Promise<void>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Define the DataProvider props type
interface DataProviderProps {
  children: ReactNode;
}

const DEFAULT_DATA_TYPES = [
  {
    name: "Number",
    note: "Stores numeric values such as '1', '-1' and '2.4",
    isComplex: false,
  },
  { name: "Boolean", note: "Stores true/false values", isComplex: false },
  { name: "Text", note: "Stores string values", isComplex: false },
];

async function initializeDataTypes() {
  await Promise.all(
    DEFAULT_DATA_TYPES.map((dataType) =>
      createUniqueDataType(dataType.name, dataType.note, dataType.isComplex)
    )
  );
}

export function DataProvider({ children }: DataProviderProps) {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [dataTypes, setDataTypes] = useState([]);

  // Fetch DataTypes
  useEffect(() => {
    async function loadAndSetDataTypes() {
      await initializeDataTypes();
      const types = await fetchDataTypes();
      setDataTypes(types);
    }
    loadAndSetDataTypes();
  }, []);

  // Fetch user profiles on mount
  useEffect(() => {
    async function loadProfiles() {
      const profiles = await fetchUserProfiles();
      setUserProfiles(profiles);
    }
    loadProfiles();
  }, []);

  // Function to create a new category and update state
  async function makeDataCategory() {
    await createDataCategory("New Category");
  }

  // Reintroduce the subscription to real-time updates
  useEffect(() => {
    const unsubscribeCategories = subscribeToDataCategories(setDataCategories);
    const unsubscribeEntries = subscribeToDataEntries(setDataEntries);

    // Cleanup function to unsubscribe when the component is unmounted
    return () => {
      console.log("Cleaning up subscriptions");
      unsubscribeCategories();
      unsubscribeEntries();
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        userProfiles,
        dataCategories,
        dataEntries,
        dataTypes,
        makeDataCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to access the context
export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
