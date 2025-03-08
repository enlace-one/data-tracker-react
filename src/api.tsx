import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

import {
  UserProfile,
  DataCategory,
  DataEntry,
  DataType,
  FormDataType as FormData,
} from "./types"; // ✅ Import interfaces

// Initialize the Amplify client
const client = generateClient<Schema>();

/**
 * Fetch user profiles from the database.
 * @returns {Promise<UserProfile[]>} List of user profiles.
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

// Function to fetch all existing DataTypes
export async function fetchDataTypes(): Promise<Schema["DataType"]["type"][]> {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list();
    console.log("Data Types:", dataTypes, " Errors: ", errors);
    return dataTypes || [];
  } catch (error) {
    console.error("Error fetching data types:", error);
    return [];
  }
}

export async function createUniqueDataType(
  name: string,
  note: string,
  isComplex: boolean
) {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list({
      filter: { name: { eq: name } },
    });

    if (dataTypes.length === 0) {
      await createDataType({
        name: name,
        note: note,
        isComplex: isComplex,
      });
      console.log(`✅ Created DataType: ${name}.`);
    } else {
      console.log(`DataType "${name}" already exists, skipping.`);
    }
  } catch (error) {
    console.error("Error creating DataType:", error);
  }
}

export async function createDataType(formData: FormData): Promise<void> {
  try {
    console.log("Adding type:", formData.name ?? "Unnamed Type"); // Avoid undefined

    const { errors } = await client.models.DataType.create({
      name: formData.name ?? "", // Ensure a default empty string
      note: formData.note ?? "", // Default to empty string
      isComplex: formData.isComplex ?? false, // Default to false for boolean
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating type:", error);
    throw error; // Ensure the function consistently returns a Promise<DataType>
  }
}

/**
 * Subscribe to real-time updates for data categories.
 * @param {Function} callback - Function to update state with new data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDataTypes(
  callback: (items: Schema["DataType"]["type"][]) => void
): () => void {
  const sub = client.models.DataType.observeQuery().subscribe({
    next: (result: { items?: Schema["DataType"]["type"][] }) => {
      console.log("Updating DataTypes:", result.items);
      callback(result.items ?? []); // Ensure an empty array if undefined
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

export async function deleteAllDataTypes() {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list();

    if (dataTypes.length === 0) {
      console.log("No DataTypes to delete.");
      return;
    }

    await Promise.all(
      dataTypes.map((dataType: Schema["DataType"]["type"]) =>
        deleteDataType(dataType.id)
      )
    );

    console.log("✅ All DataTypes have been deleted.");
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}

export async function deleteDataType(id: string) {
  try {
    await client.models.DataType.delete({ id: id });

    console.log(`Data type deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}

export async function deleteDataCategory(id: string) {
  try {
    await client.models.DataCategory.delete({ id: id });

    console.log(`Data Category deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataCategory:", error);
  }
}

export async function deleteDataEntry(id: string) {
  try {
    await client.models.DataEntry.delete({ id: id });

    console.log(`Data entry deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataEntry:", error);
  }
}

/**
 * Create a new data category.
 * @param {string} name - Name of the category.
 * @returns {Promise<void>}
 */
export async function createDataCategory(formData: FormData): Promise<void> {
  try {
    console.log("Adding category:", formData.name); // Fixed incorrect variable reference

    const { errors } = await client.models.DataCategory.create({
      name: formData.name || "", // Ensure a default empty string if missing
      defaultValue: formData.defaultValue || "", // Default empty string
      note: formData.note || "", // Default empty string
      addDefault: formData.addDefault ?? false, // Default to false for boolean
      dataTypeId: formData.dataTypeId,
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data category:", error);
  }
}

/**
 * Create a new data entry.
 * @param {string} name - Name of the entry.
 * @returns {Promise<void>}
 */
export async function createDataEntry(formData: FormData): Promise<void> {
  try {
    console.log("Adding Entry:", formData.date); // Fixed incorrect variable reference

    const { errors } = await client.models.DataEntry.create({
      date: formData.date!, // Ensure a default empty string if missing
      note: formData.note || "", // Default empty string
      value: formData.value!,
      dataCategoryId: formData.dataCategoryId,
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data Entry:", error);
  }
}

/**
 * Subscribe to real-time updates for data categories.
 * @param {Function} callback - Function to update state with new data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDataCategories(
  callback: (items: Schema["DataCategory"]["type"][]) => void
): () => void {
  const sub = client.models.DataCategory.observeQuery().subscribe({
    next: (result: { items?: Schema["DataCategory"]["type"][] }) => {
      console.log("Updating DataCategories:", result.items);
      callback(result.items || []);
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

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

  return () => sub.unsubscribe(); // Cleanup function
}

// Export the client instance if needed elsewhere
export { client };
