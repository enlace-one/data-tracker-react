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
} from "./api";

// Define types for the data
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  // Add other fields based on your UserProfile model
}

interface DataCategory {
  id: string;
  name: string;
  // Add other fields based on your DataCategory model
}

interface DataEntry {
  id: string;
  name: string;
  categoryId: string;
  // Add other fields based on your DataEntry model
}

// Define the context value type
interface DataContextType {
  userProfiles: UserProfile[];
  dataCategories: DataCategory[];
  dataEntries: DataEntry[];
  makeDataCategory: () => Promise<void>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Define the DataProvider props type
interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);

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
      unsubscribeCategories();
      unsubscribeEntries();
    };
  }, []);

  return (
    <DataContext.Provider
      value={{ userProfiles, dataCategories, dataEntries, makeDataCategory }}
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
