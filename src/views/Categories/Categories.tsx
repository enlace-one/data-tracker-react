import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";

export default function Categories() {
  const { dataCategories, makeDataCategory } = useData();

  return (
    <>
      <Heading level={1}>Data Categories</Heading>
      <Divider />
      {dataCategories.map((cat) => (
        <p key={cat.id}>
          Cat: {cat.name} {cat.id}
        </p>
      ))}
      <Button onClick={makeDataCategory}>Add Category</Button>
    </>
  );
}
