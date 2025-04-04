import { evaluate } from "mathjs";
import {
  DataCategory,
  DataEntry,
  EnrichedDataCategory,
  FormDataType,
  Macro,
} from "./types";

export const parseTimeToNumber = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const decimalMinutes = (minutes / 60) * 100;
  return hours + Math.round(decimalMinutes) / 100; // Convert HH:mm to HH.MM
};

export const parseNumberToTime = (decimalTime: number): string => {
  const hours = Math.floor(decimalTime);
  const decimalMinutes = decimalTime - hours;
  const minutes = Math.round(decimalMinutes * 60);

  // Ensure minutes are always two digits
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${hours}:${formattedMinutes}`;
};

export const parseBooleanToNumber = (boolean: string) => {
  return boolean === "true" || boolean === "True" ? 1 : 0;
};

export const parseTimeToDisplayValue = (time: string): string => {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minutes = minuteStr; // Keep minutes as a string for display
  const period = hour >= 12 ? "PM" : "AM";

  // Convert hour from 24-hour to 12-hour format
  hour = hour % 12 || 12; // Convert 0 to 12 for midnight and 12 to 12 for noon

  return `${hour}:${minutes} ${period}`;
};

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function parseComplexNumberToNumber(complexNumber: string) {
  return evaluate(complexNumber);
}

export function parseStringToBoolean(input: string | boolean): boolean {
  if (typeof input === "boolean") return input;
  if (typeof input !== "string") {
    console.log("Unexpected value in parseStringToBoolean", input);
    return false;
  }
  return ["true", "1"].includes(input.toLowerCase().trim());
}

export async function runMacros(
  macros: Macro[],
  date: string,
  dataCategories: EnrichedDataCategory[],
  fetchDataEntriesByCategory: (categoryId: string) => Promise<DataEntry[]>,
  updateDataCategory: (formData: FormDataType) => Promise<void>,
  updateMacro: (formData: FormDataType) => Promise<void>
): Promise<void> {
  const throwError = async (errorMessage: string, macro: Macro) => {
    console.warn(errorMessage);
    const formData = {
      id: macro.id,
      lastRunOutput: errorMessage,
    };
    await updateMacro(formData);
    throw new Error(errorMessage);
  };
  for (const macro of macros) {
    try {
      // evaluate Cron
      const cron = true;
      if (cron) {
        // Evaluate Formula
        let formula = macro.formula;
        const placeholderRegex = /\[([^\]]+)\]/g;
        let match;
        while ((match = placeholderRegex.exec(macro.formula)) !== null) {
          const categoryName = match[1]; // e.g., "Weight"
          const category = dataCategories.find(
            (cat) => cat.name === categoryName
          );

          if (category) {
            const entries = await fetchDataEntriesByCategory(category.id);
            const entry = entries.find((e) => e.date === date);
            if (entry) {
              formula = formula.replace(`[${categoryName}]`, entry.value);
            } else {
              await throwError(
                `No entry found for ${date} on "${categoryName}"`,
                macro
              );
            }
          } else {
            await throwError(
              `No category found matching "${categoryName}"`,
              macro
            );
          }
        }
        console.log("Processed Formula:", formula);
      }
    } catch (e) {
      console.log("Error on macro", e);
    }
  }
}
