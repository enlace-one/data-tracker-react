import { evaluate } from "mathjs";
import later from "@breejs/later";
import { DataEntry, EnrichedDataCategory, Macro } from "./types";
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

export const parseTimeDifferenceToNumber = (complexTime: string) => {
  const [time1, time2] = complexTime.split("-");
  let time1Number = parseTimeToNumber(time1);
  let time2Number = parseTimeToNumber(time2);
  if (time2Number < time1Number) {
    time2Number += 24;
  }
  return Number((time2Number - time1Number).toFixed(2));
};

export const parseNumberToTime = (decimalTime: number): string => {
  const hours = Math.floor(decimalTime);
  const decimalMinutes = decimalTime - hours;
  const minutes = Math.round(decimalMinutes * 60);

  // Ensure minutes are always two digits
  const formattedMinutes = minutes.toString().padStart(2, "0");

  const formattedHours = hours.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
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

export const parseEntryToNumber = (
  entry: DataEntry,
  category: EnrichedDataCategory
) => {
  const inputType = category.dataType.inputType;
  const typeId = category.dataType.id;
  return inputType == "boolean-string"
    ? parseBooleanToNumber(entry.value)
    : typeId == "select-numeric-001"
    ? parseNumericSelectToNumber(entry.value)
    : inputType == "time"
    ? parseTimeToNumber(entry.value)
    : inputType == "time-difference"
    ? parseTimeDifferenceToNumber(entry.value)
    : typeId == "complex-number-001"
    ? parseComplexNumberToNumber(entry.value)
    : Number(entry.value);
};

export const parseEntryValueToNumber = (
  value: string,
  category: EnrichedDataCategory,
  type: "text" | "output" | "value 1" | "value 2" | "value 3"
) => {
  const inputType = category.dataType.inputType;
  const typeId = category.dataType.id;
  let finalOutput;
  if (type == "text") {
    return value;
  }
  if (
    type == "output" ||
    !(inputType == "time-difference" || typeId == "complex-number-001")
  ) {
    finalOutput =
      inputType == "boolean-string"
        ? parseBooleanToNumber(value)
        : typeId == "select-numeric-001"
        ? parseNumericSelectToNumber(value)
        : inputType == "time"
        ? parseTimeToNumber(value)
        : inputType == "time-difference"
        ? parseTimeDifferenceToNumber(value)
        : typeId == "complex-number-001"
        ? parseComplexNumberToNumber(value)
        : Number(value);
  } else if (type == "value 1") {
    value = value.replace(":", ".");
    const match = String(value).match(/-?\d*\.?\d+/);
    finalOutput = match ? parseFloat(match[0]) : 0;
  } else if (type == "value 2") {
    value = value.replace(":", ".");
    const match = String(value).match(/-?\d*\.?\d+/g);
    finalOutput = match ? parseFloat(match[1]) : 0;
  } else if (type == "value 3") {
    value = value.replace(":", ".");
    const match = String(value).match(/-?\d*\.?\d+/g);
    finalOutput = match ? parseFloat(match[2]) : 0;
  }
  console.debug(
    `[data tracker] Parsed value is ${finalOutput} for ${category.name}`
  );
  return finalOutput;
};

export const parseEntryToDisplayValue = (
  entry: DataEntry,
  category: EnrichedDataCategory
) => {
  const inputType = category.dataType.inputType;
  // const typeId = category.dataType.id;
  return inputType == "time"
    ? parseTimeToDisplayValue(entry.value)
    : entry.value;
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

export function parseNumericSelectToNumber(value: string) {
  return Number(value.split("(")[1].split(")")[0]);
}

export async function addDefaults(dataCategories: EnrichedDataCategory[]) {
  const promises = dataCategories
    .filter((cat) => cat.addDefault && cat.defaultValue != "")
    .map((cat) => {
      console.log("Adding defauult entry for", cat.name);
      createDataEntry(
        {
          date: new Date().toLocaleDateString("en-CA"),
          note: "Added as default",
          value: cat.defaultValue ?? "",
          dataCategoryId: cat.id,
        },
        false
      );
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

export const fillAllDates = (sortedDates: string[]) => {
  const maxDate = sortedDates[sortedDates.length - 1];
  const minDate = sortedDates[0];
  const allDatesSorted = [minDate];
  let currentDate = new Date(minDate);

  while (currentDate < new Date(maxDate)) {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    allDatesSorted.push(currentDate.toISOString().split("T")[0]);
  }

  return allDatesSorted;
};
