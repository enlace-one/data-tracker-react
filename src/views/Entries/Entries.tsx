import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";

export default function Entries() {
  const { dataEntries } = useData();

  return (
    <>
      <Heading level={1}>Data Entries</Heading>
      <Divider />
      {dataEntries.map((entry) => (
        <p key={entry.id}>{entry.name}</p>
      ))}
    </>
  );
}
