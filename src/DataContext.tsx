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

import {
  UserProfile,
  EnrichedDataCategory,
  DataType,
  ActiveTab,
} from "./types";

interface AlertInfo {
  message: string;
  type: string;
}
type SetActionMessageFunction = (alertInfo: AlertInfo) => void;

interface DataContextType {
  actionMessage: AlertInfo;
  setActionMessage: SetActionMessageFunction;
  userProfiles: UserProfile[];
  dataCategories: EnrichedDataCategory[];
  dataTypes: DataType[];
  SETTINGS: { debug: boolean; version: string };
  selectedCategory: EnrichedDataCategory | null;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<EnrichedDataCategory | null>
  >;
  screenWidth: number;
  activeTab: ActiveTab;
  setActiveTab: (state: ActiveTab) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const DEFAULT_DATA_TYPES = [
  {
    name: "Number",
    note: "Stores numeric values",
    isComplex: false,
    inputType: "number",
  },
  {
    name: "Boolean",
    note: "Stores true/false values",
    isComplex: false,
    inputType: "boolean-string",
  },
  {
    name: "Text",
    note: "Stores string values",
    isComplex: false,
    inputType: "string",
  },
  {
    name: "Time",
    note: "Stores time values",
    isComplex: false,
    inputType: "time",
  },
  {
    name: "Complex Number",
    note: "Stores multiple related numbers",
    isComplex: true,
    pattern:
      "(\\(?\\d+(\\.\\d+)?\\)?)[*/+-](\\(?\\d+(\\.\\d+)?\\)?)([*/+-](\\(?\\d+(\\.\\d+)?\\)?))*",
    inputType: "text",
  },
];

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.get("debug") === "true";
const SETTINGS = { debug: isDebugMode, version: "1.0.0" };

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
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [actionMessage, _setActionMessage] = useState<AlertInfo>({
    message: "",
    type: "",
  });
  const [selectedCategory, setSelectedCategory] =
    useState<EnrichedDataCategory | null>(null);
  const [activeTab, _setActiveTab] = useState<ActiveTab>("day");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const setActiveTab = (state: ActiveTab) => {
    _setActiveTab(state);
    setSelectedCategory(null);
  };

  useEffect(() => {
    const sub = client.models.DataType.observeQuery().subscribe({
      next: ({ items }) => setDataTypes([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const setActionMessage = (alertInfo: AlertInfo) => {
    _setActionMessage(alertInfo);
    setTimeout(() => _setActionMessage({ message: "", type: "" }), 10000);
  };

  useEffect(() => {
    async function loadAndSetDataTypes() {
      await initializeDataTypes();
      const types = await fetchDataTypes();
      setDataTypes(types);
    }
    loadAndSetDataTypes();
  }, []);

  useEffect(() => {
    async function loadProfiles() {
      const profiles = await fetchUserProfiles();
      setUserProfiles(profiles);
    }
    loadProfiles();
  }, []);

  useEffect(() => {
    const unsubscribeCategories = subscribeToDataCategories(setDataCategories);
    return () => unsubscribeCategories();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () => setScreenWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setScreenWidth(window.innerWidth)
      );
  }, []);

  return (
    <DataContext.Provider
      value={{
        userProfiles,
        dataCategories,
        actionMessage,
        setActionMessage,
        dataTypes,
        SETTINGS,
        selectedCategory,
        setSelectedCategory,
        screenWidth,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export { SETTINGS };
