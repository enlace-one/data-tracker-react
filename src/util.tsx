import { evaluate } from "mathjs";
import later from "@breejs/later";
import { EnrichedDataCategory, Macro } from "./types";
import {
  createDataEntry,
  fetchDataEntries,
  fetchDataEntriesByCategory,
  updateDataCategoryLastEntryDate,
  updateMacroRun,
} from "./api";
import moment from "moment";

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
  return ["true", "1", "True", "TRUE"].includes(input.toLowerCase().trim());
}

export async function runMacros(
  macros: Macro[],
  date: string,
  dataCategories: EnrichedDataCategory[]
): Promise<void> {
  const throwError = async (errorMessage: string, macro: Macro) => {
    console.warn(errorMessage);

    await updateMacroRun(macro, date, errorMessage);
    throw new Error(errorMessage);
  };
  for (const macro of macros) {
    try {
      // Pick date, now unless this is called from day view with another date.
      let dateToEval = new Date();
      if (date != dateToEval.toLocaleDateString("en-CA")) {
        dateToEval = new Date(date);
      }
      // evaluate Cron
      const cronExpression = macro.schedule; // '*/5 * * * *'; // Every 5 minutes
      const schedule = later.parse.cron(cronExpression, true); // true = use local time
      const cronIsMatch = later.schedule(schedule).isValid(new Date());
      console.log(
        `Cron expression ${macro.schedule} evaluates as ${cronIsMatch}`
      );

      if (cronIsMatch) {
        const macroDataCategory = dataCategories.find(
          (cat) => cat.id === macro.dataCategoryId
        );

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
            let value;
            if (entry) {
              if (category.dataType.inputType == "boolean-string") {
                value = parseBooleanToNumber(entry.value);
              } else if (category.dataType.inputType == "time") {
                value = parseTimeToNumber(entry.value);
              } else if (category.dataType.inputType == "math") {
                value = parseComplexNumberToNumber(entry.value);
              } else {
                value = entry.value;
              }
              console.log(
                `Replacing ${categoryName} with ${value} based on ${entry.value}`
              );
            } else {
              value = 0;
              console.log(
                `Replacing ${categoryName} with ${value} as no entry was found`
              );
            }
            formula = formula.replace(`[${categoryName}]`, value);
          } else {
            await throwError(
              `No category found matching "${categoryName}"`,
              macro
            );
          }
        }
        console.log("Processed Formula:", formula);
        const output = evaluate(formula);
        if (output == undefined) {
          await throwError(
            `No output (${output}) for formula "${formula}"`,
            macro
          );
        }
        let valueToSet = String(output);
        console.log("output:", output);
        if (macroDataCategory?.dataType.inputType == "boolean-string") {
          valueToSet = String(!!output);
        }

        await createDataEntry({
          date: date,
          dataCategoryId: macroDataCategory?.id,
          value: valueToSet,
          note: `Set by macro ${macro.name}`,
        });

        await updateMacroRun(
          macro,
          date,
          `"${formula}" = ${output} = ${valueToSet}`
        );
      }
    } catch (e) {
      console.log("Error on macro", e);
    }
  }
}

export async function addDefaults(dataCategories: EnrichedDataCategory[]) {
  const promises = dataCategories
    .filter((cat) => cat.addDefault && cat.defaultValue != "")
    .map((cat) => {
      console.log("Adding defauult entry for", cat.name);
      createDataEntry({
        date: new Date().toLocaleDateString("en-CA"),
        note: "Added as default",
        value: cat.defaultValue ?? "",
        dataCategoryId: cat.id,
      });
    });

  await Promise.all(promises);
}

export async function setLastEntryDates(
  dataCategories: EnrichedDataCategory[]
) {
  const dataEntries = await fetchDataEntries(50);
  const catsDone: string[] = [];

  for (const cat of dataCategories) {
    if (!catsDone.includes(cat.id)) {
      const entry = dataEntries.find(
        (entry) => entry.dataCategoryId === cat.id
      );
      if (entry && entry.date !== cat.lastEntryDate) {
        await updateDataCategoryLastEntryDate(cat.id, entry.date);
      }
      catsDone.push(cat.id);
    }
  }
}

export function getPrettyNameForDate(date: string) {
  const today = new Date().toLocaleDateString("en-CA");
  if (date == today) {
    return "Today";
  } else {
    return moment(date).fromNow();
  }
}
