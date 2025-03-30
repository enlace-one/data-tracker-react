import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchUserProfiles,
  subscribeToDataCategories,
  createUniqueDataType,
  fetchDataTypes,
  client,
} from "./api";

import { UserProfile, EnrichedDataCategory, DataType } from "./types"; // ✅ Import interfaces

interface AlertInfo {
  message: string;
  type: string;
}
type SetActionMessageFunction = (alertInfo: AlertInfo) => void;

// Define the context value type
interface DataContextType {
  actionMessage: AlertInfo;
  setActionMessage: SetActionMessageFunction;
  userProfiles: UserProfile[];
  dataCategories: EnrichedDataCategory[];
  // dataEntries: DataEntry[];
  dataTypes: DataType[];
  SETTINGS: { debug: boolean };
  selectedCategory: EnrichedDataCategory | null;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<EnrichedDataCategory | null>
  >;
  screenWidth: number;
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
    inputType: "number",
  },
  {
    name: "Boolean",
    note: "Stores true/false values",
    isComplex: false,
    inputType: "boolean",
  },
  {
    name: "Text",
    note: "Stores string values",
    isComplex: false,
    inputType: "string",
  },
  {
    name: "Time",
    note: "Stores time values such as 10:00 PM",
    isComplex: false,
    inputType: "time",
  },
];

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.get("debug") === "true";

const SETTINGS = { debug: isDebugMode };

async function initializeDataTypes() {
  await Promise.all(
    DEFAULT_DATA_TYPES.map((dataType) =>
      createUniqueDataType(
        dataType.name,
        dataType.note,
        dataType.inputType,
        dataType.isComplex
      )
    )
  );
}

export function DataProvider({ children }: DataProviderProps) {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [dataCategories, setDataCategories] = useState<EnrichedDataCategory[]>(
    []
  );
  // const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [actionMessage, _setActionMessage] = useState<AlertInfo>({
    message: "",
    type: "",
  }); // Initialize with an empty string
  const [selectedCategory, setSelectedCategory] =
    useState<EnrichedDataCategory | null>(null); // Correct as is
  useEffect(() => {
    const sub = client.models.DataType.observeQuery().subscribe({
      next: ({ items }) => {
        console.log("Setting data type to ", items);
        setDataTypes([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  const setActionMessage = (alertInfo: AlertInfo) => {
    _setActionMessage(alertInfo);
    console.log("Alert", alertInfo.type, ":", alertInfo.message);

    // Clear the message after 10 seconds
    setTimeout(() => {
      _setActionMessage({ message: "", type: "" });
    }, 10000); // 10000 milliseconds = 10 seconds
  };

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

  // Reintroduce the subscription to real-time updates
  useEffect(() => {
    const unsubscribeCategories = subscribeToDataCategories(setDataCategories);
    // const unsubscribeEntries = subscribeToDataEntries(setDataEntries);
    // const unsubscribeTypes = subscribeToDataTypes(setDataTypes);

    // Cleanup function to unsubscribe when the component is unmounted
    return () => {
      console.log("Cleaning up subscriptions");
      unsubscribeCategories();
      // unsubscribeEntries();
      // unsubscribeTypes();
    };
  }, []);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    // Set up event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DataContext.Provider
      value={{
        userProfiles,
        dataCategories,
        actionMessage,
        setActionMessage,
        // dataEntries,
        dataTypes,
        SETTINGS,
        selectedCategory,
        setSelectedCategory,
        screenWidth,
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

export { SETTINGS };
