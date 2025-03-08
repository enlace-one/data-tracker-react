import { SetStateAction, useState } from "react";
import styles from "./DateSpan.module.css";

interface Props {
  date: string;
}

const DateSpan = ({ date }: Props) => {
  const dateObject = new Date(date);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(dateObject);
  return (
    // <> is a shortcut for a fragment, allows returning mutliple elements
    <span>{formattedDate}</span>
  );
};

export default DateSpan;
