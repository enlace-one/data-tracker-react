import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

// Initialize the Amplify client
const client = generateClient({
  authMode: "userPool",
});

/**
 * Type for UserProfile object (based on the schema from your backend)
 */
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  // Define other fields as necessary based on the UserProfile model
}

/**
 * Type for DataCategory object (based on your backend schema)
 */
interface DataCategory {
  id: string;
  name: string;
  // Define other fields as necessary based on the DataCategory model
}

/**
 * Type for DataEntry object (based on your backend schema)
 */
interface DataEntry {
  id: string;
  name: string;
  categoryId: string;
  // Define other fields as necessary based on the DataEntry model
}

/**
 * Fetch user profiles from the database.
 * @returns {Promise<UserProfile[]>} List of user profiles.
 */
export async function fetchUserProfiles(): Promise<UserProfile[]> {
  try {
    const { data: profiles } = await client.models.UserProfile.list();
    return profiles || [];
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
}

/**
 * Fetch data categories from the database.
 * @returns {Promise<DataCategory[]>} List of data categories.
 */
export async function fetchDataCategories(): Promise<DataCategory[]> {
  try {
    const { data: categories } = await client.models.DataCategory.list();
    return categories || [];
  } catch (error) {
    console.error("Error fetching data categories:", error);
    return [];
  }
}

/**
 * Fetch data entries from the database.
 * @returns {Promise<DataEntry[]>} List of data entries.
 */
export async function fetchDataEntries(): Promise<DataEntry[]> {
  try {
    const { data: entries } = await client.models.DataEntry.list();
    return entries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
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

// Export the client instance if needed elsewhere
export { client };
