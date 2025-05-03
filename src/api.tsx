import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import {
  DataType,
  EnrichedDataCategory,
  EnrichedDataEntry,
  FormDataType as FormData,
  Macro,
  Topic,
  UserProfile,
} from "./types";
import { DEFAULT_DATA_TYPES, EXAMPLE_DATA } from "./settings";

// Initialize the Amplify client
const client = generateClient<Schema>();

// DataCategory Functions
/**
 * Adds example data categories and entries.
 * @param {boolean} [skipConfirmation=false] - Skips confirmation prompt if true.
 * @returns {Promise<void>}
 */
export async function addExampleData(skipConfirmation = false): Promise<void> {
  if (!skipConfirmation) {
    const isConfirmed = window.confirm(
      "Are you sure you want to add example data? It will add several categories and entries"
    );
    if (!isConfirmed) {
      console.log("Add examples cancelled by user.");
      return;
    }
  }
  for (const data of EXAMPLE_DATA) {
    console.log("Adding example cat:", data.category.name);
    try {
      await createDataCategory(data.category);
    } catch (e) {
      console.log("Error ", e);
    }
  }
  const { data: categories } = await client.models.DataCategory.list();
  for (const cat of categories) {
    const data = EXAMPLE_DATA.find((d) => d.category.name == cat.name);
    if (data) {
      let counter = 0;
      for (const entry of data.entries) {
        const date = new Date();
        date.setDate(date.getDate() - counter);
        const date_string = date.toLocaleDateString("en-CA");
        await createDataEntry({
          ...entry,
          dataCategoryId: cat.id,
          date: date_string,
        });
        counter += 1;
      }
    }
  }
}

/**
 * Creates a new data category.
 * @param {FormData} formData - Form data for the category.
 * @returns {Promise<void>}
 */
export async function createDataCategory(formData: FormData): Promise<void> {
  const { data } = await client.models.DataCategory.listDataCategoryByName({
    name: formData.name!,
  });
  if (data.length > 0) {
    console.log("Duplicate category name");
    throw new Error("Error: Duplicate category name");
  }

  console.log("Adding category:", formData.name);

  const { errors } = await client.models.DataCategory.create({
    name: formData.name || "",
    defaultValue: formData.defaultValue || "",
    note: formData.note || "",
    addDefault: formData.addDefault ?? false,
    dataTypeId: formData.dataTypeId!,
    positiveIncrement: Number(formData.positiveIncrement || "1"),
    negativeIncrement: Number(formData.negativeIncrement || "1"),
    topicId: formData.topicId!,
    options: (formData.options || "").split(",").map((val) => val.trim()),
  });
  console.log("Errors:", errors);
}

/**
 * Deletes all data categories and their associated entries.
 * @param {EnrichedDataCategory[]} dataCategories - Array of data categories to delete.
 * @returns {Promise<void>}
 */
export async function deleteAllDataCategories(
  dataCategories: EnrichedDataCategory[]
): Promise<void> {
  for (const dataCategory of dataCategories) {
    await deleteDataCategory(dataCategory.id, true);
    console.log(`DataCategory with ID ${dataCategory.id} has been deleted.`);
  }

  console.log("All DataCategories have been deleted.");
}

/**
 * Deletes a data category and its associated entries.
 * @param {string} id - The ID of the data category.
 * @param {boolean} [skipConfirmation=false] - Skips confirmation prompt if true.
 * @returns {Promise<void>}
 */
export async function deleteDataCategory(
  id: string,
  skipConfirmation: boolean = false
): Promise<void> {
  if (!skipConfirmation) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Data Category? It will delete all associated entries."
    );
    if (!isConfirmed) {
      console.log("Deletion cancelled by user.");
      return;
    }
  }

  const { data: categoryWithEntries } = await client.models.DataCategory.get(
    { id: id },
    { selectionSet: ["id", "dataEntries.*"] }
  );

  if (!categoryWithEntries) {
    console.error(`Data Category with id ${id} not found.`);
    throw new Error("Error deleting data category");
  }

  await Promise.all(
    categoryWithEntries.dataEntries.map((entry) =>
      client.models.DataEntry.delete({ id: entry.id })
    )
  );

  await client.models.DataCategory.delete({ id: categoryWithEntries.id });

  console.log(`Data Category and associated entries deleted with id ${id}.`);
}

/**
 * Fetches a data category by its ID, including its data type.
 * @param {string} categoryId - The ID of the data category.
 * @returns {Promise<EnrichedDataCategory | null>} The data category or null if not found.
 */
export async function getDataCategory(
  categoryId: string
): Promise<EnrichedDataCategory | null> {
  try {
    const { data, errors } = await client.models.DataCategory.get({
      id: categoryId,
      include: ["dataType"],
    } as any);

    if (!data) {
      return null;
    }

    let enrichedItem = null;
    try {
      const dataType = data.dataTypeId
        ? DEFAULT_DATA_TYPES.find((dt) => dt.id === data.dataTypeId)
        : undefined;

      enrichedItem = { ...data, dataType };
    } catch (error) {
      console.error(
        `Failed to fetch dataType for ID ${data.dataTypeId}:`,
        error
      );
      enrichedItem = { ...data };
    }

    if (errors) {
      console.error("Errors fetching data category:", errors);
      return null;
    }

    if (!data) {
      console.warn(`Data category with ID ${categoryId} not found.`);
      return null;
    }

    return enrichedItem as unknown as EnrichedDataCategory;
  } catch (error) {
    console.error("Error fetching data category:", error);
    return null;
  }
}

/**
 * Subscribes to data category updates.
 * @param {(items: EnrichedDataCategory[]) => void} callback - Callback to handle updates.
 * @param {DataType[]} dataTypes - Array of data types for enrichment.
 * @param {Topic[]} topics - Array of topics for enrichment.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeToDataCategories(
  callback: (items: EnrichedDataCategory[]) => void,
  dataTypes: DataType[],
  topics: Topic[]
): () => void {
  const sub = client.models.DataCategory.observeQuery().subscribe({
    next: async (result: { items?: Schema["DataCategory"]["type"][] }) => {
      console.log("Updating DataCategories:", result.items);

      if (!result.items) {
        callback([]);
        return;
      }

      try {
        const enrichedItems = await Promise.all(
          result.items.map(async (item) => {
            const dataType = item.dataTypeId
              ? dataTypes.find((dt) => dt.id === item.dataTypeId)
              : undefined;

            const topic = item.topicId
              ? topics.find((t) => t.imageLink === item.topicId)
              : undefined;

            return { ...item, dataType, topic };
          })
        );

        enrichedItems.sort((a, b) => a.name.localeCompare(b.name));

        callback(enrichedItems as unknown as EnrichedDataCategory[]);
      } catch (error) {
        console.error("Error enriching DataCategories:", error);
        callback([]);
      }
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe();
}

/**
 * Updates an existing data category.
 * @param {FormData} formData - Form data for the category.
 * @returns {Promise<void>}
 */
export async function updateDataCategory(formData: FormData): Promise<void> {
  const { data } = await client.models.DataCategory.listDataCategoryByName({
    name: formData.name!,
  });
  if (data.length > 1) {
    console.log("Duplicate category name");
    throw new Error("Error: Duplicate category name");
  }

  console.log("Updating category:", formData.name);

  const { errors } = await client.models.DataCategory.update({
    id: formData.id!,
    name: formData.name || "",
    defaultValue: formData.defaultValue || "",
    note: formData.note || "",
    addDefault: formData.addDefault ?? false,
    dataTypeId: formData.dataTypeId!,
    positiveIncrement: Number(formData.positiveIncrement || "1"),
    negativeIncrement: Number(formData.negativeIncrement || "1"),
    topicId: formData.topicId!,
    options: (formData.options || "").split(",").map((val) => val.trim()),
  });
  console.log("Errors:", errors);
}

/**
 * Updates the entry count for a data category.
 * @param {string} categoryId - The ID of the data category.
 * @param {number} adjustment - The adjustment value for the entry count.
 * @returns {Promise<void>}
 */
export async function updateDataCategoryEntryCount(
  categoryId: string,
  adjustment: number
): Promise<void> {
  console.log(
    "Updating category entry count for category:",
    categoryId,
    "with adjustment:",
    adjustment
  );

  const { data: categoryData, errors: fetchErrors } =
    await client.models.DataCategory.get({ id: categoryId });

  if (fetchErrors) {
    console.error("Errors fetching category data:", fetchErrors);
    return;
  }

  if (!categoryData) {
    console.error("Category not found for ID:", categoryId);
    return;
  }

  const updatedEntryCount = (categoryData.entryCount || 0) + adjustment;

  const { errors: updateErrors } = await client.models.DataCategory.update({
    id: categoryId,
    entryCount: updatedEntryCount,
  });

  if (updateErrors) {
    console.log("Amplify API auth mode:", client.models.DataCategory);
    console.error("Errors updating category entry count:", updateErrors);
    throw new Error("Error updating category entry count");
  } else {
    console.log(
      "Successfully updated category entry count to:",
      updatedEntryCount
    );
  }
}

/**
 * Updates the last entry date for a data category.
 * @param {string} categoryId - The ID of the data category.
 * @param {string} date - The new last entry date.
 * @returns {Promise<void>}
 */
export async function updateDataCategoryLastEntryDate(
  categoryId: string,
  date: string
): Promise<void> {
  console.log(
    "Updating category last entry for category:",
    categoryId,
    "with date:",
    date
  );

  const { errors: updateErrors } = await client.models.DataCategory.update({
    id: categoryId,
    lastEntryDate: date,
  });

  if (updateErrors) {
    console.error("Errors updating category entry date:", updateErrors);
    throw new Error("Error updating category entry count");
  } else {
    console.log("Successfully updated category entry date:", date);
  }
}

// DataEntry Functions
/**
 * Creates a new data entry.
 * @param {FormData} formData - Form data for the entry.
 * @param {boolean} [raiseErrors=true] - Whether to throw errors on failure.
 * @returns {Promise<void>}
 */
export async function createDataEntry(
  formData: FormData,
  raiseErrors = true
): Promise<void> {
  const { data } = await client.models.DataEntry.listCategoryEntries({
    dataCategoryId: formData.dataCategoryId!,
    date: { eq: formData.date! },
  });
  if (data.length > 0) {
    console.log("Duplicate entry");
    throw new Error("Error: Duplicate entry date and category");
  }

  console.log("Adding Entry:", formData.date);

  const { errors } = await client.models.DataEntry.create({
    date: formData.date!,
    note: formData.note || "",
    value: formData.value!,
    dataCategoryId: formData.dataCategoryId!,
  });

  console.log("Errors:", errors);
  if (errors?.length && raiseErrors) {
    throw new Error(`${errors}`);
  }

  updateDataCategoryEntryCount(formData.dataCategoryId!, 1);
}

/**
 * Deletes all data entries.
 * @returns {Promise<void>}
 */
export async function deleteAllDataEntries(): Promise<void> {
  try {
    const { data: dataEntries } = await client.models.DataEntry.list();

    if (dataEntries.length === 0) {
      console.log("No Entries to delete.");
      return;
    }

    await Promise.all(
      dataEntries.map((dataEntry: Schema["DataEntry"]["type"]) =>
        deleteDataEntry(dataEntry.id)
      )
    );

    console.log("✅ All DataTypes have been deleted.");
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}

/**
 * Deletes a data entry.
 * @param {string} id - The ID of the data entry.
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise.
 */
export async function deleteDataEntry(id: string): Promise<boolean> {
  const { data: dataEntry, errors: fetchErrors } =
    await client.models.DataEntry.get({ id });

  if (fetchErrors) {
    console.error("Errors fetching data entry:", fetchErrors);
    return false;
  }

  if (!dataEntry) {
    console.error("Data entry not found for ID:", id);
    return false;
  }

  const { errors: deleteErrors } = await client.models.DataEntry.delete({
    id,
  });

  if (deleteErrors) {
    console.error("Errors deleting data entry:", deleteErrors);
    throw new Error("Error deleting data entry");
  }

  await updateDataCategoryEntryCount(dataEntry.dataCategoryId, -1);

  console.log(`Data entry deleted with id ${id}.`);
  return true;
}

/**
 * Fetches data entries by category ID.
 * @param {string} categoryId - The ID of the category.
 * @returns {Promise<Schema["DataEntry"]["type"][]>} List of data entries.
 */
export async function fetchDataEntriesByCategory(
  categoryId: string
): Promise<Schema["DataEntry"]["type"][]> {
  try {
    const { data: dataEntries, errors } =
      await client.models.DataEntry.listCategoryEntries(
        {
          dataCategoryId: categoryId,
        },
        {
          sortDirection: "DESC",
        }
      );
    console.log("Data Entry:", dataEntries, " Errors: ", errors);
    return dataEntries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
  }
}

/**
 * Fetches data entries by date.
 * @param {string} date - The date to filter entries.
 * @returns {Promise<Schema["DataEntry"]["type"][]>} List of data entries.
 */
export async function fetchDataEntriesByDate(
  date: string
): Promise<Schema["DataEntry"]["type"][]> {
  try {
    const { data: dataEntries, errors } =
      await client.models.DataEntry.listDateEntries({
        date: date,
      });
    console.log("Data Entry:", dataEntries, " Errors: ", errors);
    return dataEntries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
  }
}

/**
 * Fetches enriched data entries by date.
 * @param {string} date - The date to filter entries.
 * @returns {Promise<EnrichedDataEntry[]>} List of enriched data entries.
 */
export async function fetchEnrichedDataEntriesByDate(
  date: string
): Promise<EnrichedDataEntry[]> {
  const { data: dataEntries, errors } =
    await client.models.DataEntry.listDateEntries({
      date: date,
    });

  if (errors) {
    console.error("Errors fetching data entries:", errors);
    return [];
  }

  const enrichedItems = await Promise.all(
    dataEntries.map(async (item) => {
      try {
        let dataCategory: EnrichedDataCategory | undefined;

        if (item.category && typeof item.category === "function") {
          const resolved = await getDataCategory(item.dataCategoryId);
          dataCategory = resolved ?? undefined;
        }

        return { ...item, dataCategory };
      } catch (error) {
        console.error(
          `Failed to fetch dataCategory for ID ${item.dataCategoryId}:`,
          error
        );
        return { ...item };
      }
    })
  );

  console.log("Enriched Entries:", enrichedItems);

  return enrichedItems as unknown as EnrichedDataEntry[];
}

/**
 * Fetches data entries with pagination.
 * @param {number} limit - Number of entries to fetch.
 * @param {string | null} [nextToken=null] - Pagination token.
 * @returns {Promise<Schema["DataEntry"]["type"][]>} List of data entries.
 */
export async function fetchDataEntries(
  limit: number,
  nextToken: string | null = null
): Promise<Schema["DataEntry"]["type"][]> {
  try {
    const { data: dataEntries, errors } =
      await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: limit,
          nextToken: nextToken,
        }
      );
    console.log("Data Entry:", dataEntries, " Errors: ", errors);
    return dataEntries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
  }
}

/**
 * Subscribes to data entry updates.
 * @param {(items: Schema["DataEntry"]["type"][]) => void} callback - Callback to handle updates.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeToDataEntries(
  callback: (items: Schema["DataEntry"]["type"][]) => void
): () => void {
  const sub = client.models.DataEntry.observeQuery().subscribe({
    next: (result: { items?: Schema["DataEntry"]["type"][] }) => {
      console.log("Updating DataEntries:", result.items);
      callback(result.items || []);
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe();
}

/**
 * Updates an existing data entry.
 * @param {FormData} formData - Form data for the entry.
 * @returns {Promise<void>}
 */
export async function updateDataEntry(formData: FormData): Promise<void> {
  const { data } = await client.models.DataEntry.listCategoryEntries({
    dataCategoryId: formData.dataCategoryId!,
    date: { eq: formData.date! },
  });
  if (data.length > 1) {
    console.log("Duplicate entry");
    throw new Error("Error: Duplicate entry date and category");
  }

  console.log("Updating Entry:", formData.date);

  const { errors } = await client.models.DataEntry.update({
    id: formData.id!,
    date: formData.date!,
    note: formData.note || "",
    value: formData.value!,
    dataCategoryId: formData.dataCategoryId!,
  });
  console.log("Errors:", errors);
}

// Macro Functions
/**
 * Creates a new macro.
 * @param {FormData} formData - Form data for the macro.
 * @returns {Promise<void>}
 */
export async function createMacro(formData: FormData): Promise<void> {
  console.log("Creating Macro:", formData.name);

  const { errors } = await client.models.Macro.create({
    name: formData.name || "",
    note: formData.note || "",
    formula: formData.formula || "",
    schedule: formData.schedule || "",
    dataCategoryId: formData.dataCategoryId!,
    lastRunDate: formData.lastRunDate || "",
    priority: formData.priority || 3,
  });
  console.log("Errors:", errors);
  if (errors) {
    throw new Error(String(errors));
  }
}

/**
 * Deletes a macro.
 * @param {string} id - The ID of the macro.
 * @returns {Promise<void>}
 */
export async function deleteMacro(id: string): Promise<void> {
  try {
    await client.models.Macro.delete({ id: id });

    console.log(`Data macro deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting Macro:", error);
  }
}

/**
 * Fetches all macros sorted by priority.
 * @returns {Promise<Macro[]>} List of macros.
 */
export async function fetchMacros(): Promise<Macro[]> {
  try {
    const { data: macros, errors } = await client.models.Macro.listByPriority(
      { dummy: 0 },
      {
        sortDirection: "ASC",
      }
    );
    console.log("Macros: ", macros, " Errors: ", errors);
    return macros || [];
  } catch (error) {
    console.error("Error fetching macros:", error);
    return [];
  }
}

/**
 * Updates an existing macro.
 * @param {FormData} formData - Form data for the macro.
 * @returns {Promise<void>}
 */
export async function updateMacro(formData: FormData): Promise<void> {
  console.log("Updating Macro:", formData);

  const { errors } = await client.models.Macro.update({
    id: formData.id!,
    name: formData.name || "",
    note: formData.note || "",
    formula: formData.formula || "",
    schedule: formData.schedule || "",
    lastRunOutput: formData.lastRunOutput || "",
    lastRunDate: formData.lastRunDate,
  });
  console.log("Errors:", errors);
  if (errors) {
    throw new Error(String(errors));
  }
}

/**
 * Updates a macro's last run details.
 * @param {Macro} macro - The macro to update.
 * @param {string} lastRunDate - The last run date.
 * @param {string} lastRunOutput - The last run output.
 * @returns {Promise<void>}
 */
export async function updateMacroRun(
  macro: Macro,
  lastRunDate: string,
  lastRunOutput: string
): Promise<void> {
  const formData = {
    id: macro.id,
    name: macro.name,
    lastRunOutput: lastRunOutput,
    lastRunDate: lastRunDate,
    schedule: macro.schedule,
    formula: macro.formula,
    note: macro.note ?? "",
  };
  await updateMacro(formData);
}

// UserProfile Functions
/**
 * Deletes a user profile.
 * @param {FormData} formData - Form data for the profile.
 * @returns {Promise<void>}
 */
export async function deleteProfile(formData: FormData): Promise<void> {
  console.log("Deleting Profile:", formData);

  const { errors } = await client.models.UserProfile.delete({
    id: formData.id!,
  });
  console.log("Errors:", errors);
  if (errors) {
    throw new Error(String(errors));
  }
}

/**
 * Fetches all user profiles.
 * @returns {Promise<Schema["UserProfile"]["type"][]>} List of user profiles.
 */
export async function fetchUserProfiles(): Promise<
  Schema["UserProfile"]["type"][]
> {
  try {
    const { data: profiles, errors } = await client.models.UserProfile.list();
    console.log("Profiles: ", profiles, " Errors: ", errors);
    return profiles || [];
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
}

/**
 * Saves a custom order for categories.
 * @param {string[]} newOrder - The new order of category IDs.
 * @param {UserProfile[]} userProfiles - Array of user profiles.
 * @returns {Promise<void>}
 */
export async function saveCustomOrder(
  newOrder: string[],
  userProfiles: UserProfile[]
): Promise<void> {
  try {
    await updateProfile(
      {
        id: userProfiles[0].id!,
        email: userProfiles[0].email!,
        isNew: userProfiles[0].isNew!,
        topicColorPreference: userProfiles[0].topicColorPreference!,
        categorySortPreference: userProfiles[0].categorySortPreference!,
        customCategoryOrder: newOrder,
      },
      userProfiles[0]
    );
    console.log("Custom order saved!");
  } catch (e) {
    console.log("Failed to save custom order:", e);
  }
}

/**
 * Updates an existing user profile.
 * @param {FormData} formData - Form data for the profile.
 * @param {UserProfile} userProfile - The current user profile.
 * @returns {Promise<void>}
 */
export async function updateProfile(
  formData: FormData,
  userProfile: UserProfile
): Promise<void> {
  console.log("Updating Profile:", formData);

  const { errors } = await client.models.UserProfile.update({
    id: formData.id!,
    email: formData.email,
    isNew: formData.isNew,
    topicColorPreference: formData.topicColorPreference,
    categorySortPreference: formData.categorySortPreference,
    customCategoryOrder:
      formData.customCategoryOrder ?? userProfile.customCategoryOrder,
  });
  console.log("Errors:", errors);
  if (errors) {
    throw new Error(String(errors));
  }
}

// Export the client instance
export { client };
