import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import { UserProfile, DataCategory, DataEntry, DataType } from "./types"; // ✅ Import interfaces

// Initialize the Amplify client
const client = generateClient({
  authMode: "userPool",
});

/**
 * Fetch user profiles from the database.
 * @returns {Promise<UserProfile[]>} List of user profiles.
 */
export async function fetchUserProfiles(): Promise<UserProfile[]> {
  try {
    const { data: profiles } = await client.models.UserProfile.list();
    console.log("Profiles: ", profiles);
    return profiles || [];
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
}

// Function to fetch all existing DataTypes
export async function fetchDataTypes() {
  return await client.models.DataType.list();
}

export async function createUniqueDataType(
  name: string,
  note: string,
  isComplex: boolean
) {
  const existingTypes = await client.models.DataType.list({
    filter: { name: { eq: name } },
  });

  if (existingTypes.length === 0) {
    await client.models.DataType.create({ name, note, isComplex });
    console.log(`✅ Created DataType: ${name}`);
  } else {
    console.log(`DataType "${name}" already exists, skipping.`);
  }
}

/**
 * Create a new data category.
 * @param {string} name - Name of the category.
 * @returns {Promise<void>}
 */
export async function createDataCategory(name: string): Promise<void> {
  try {
    await client.models.DataCategory.create({ name });
  } catch (error) {
    console.error("Error creating data category:", error);
  }
}

/**
 * Subscribe to real-time updates for data categories.
 * @param {Function} callback - Function to update state with new data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDataCategories(
  callback: (items: DataCategory[]) => void
): () => void {
  const sub = client.models.DataCategory.observeQuery().subscribe({
    next: ({ items }) => {
      console.log("Updating DataCategories:", items);
      callback(items || []);
    },
    error: (error) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

export function subscribeToDataEntries(callback) {
  const sub = client.models.DataEntry.observeQuery().subscribe({
    next: ({ items }) => {
      console.log("Updating DataEntries:", items);
      callback(items || []);
    },
    error: (error) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

// Export the client instance if needed elsewhere
export { client };
