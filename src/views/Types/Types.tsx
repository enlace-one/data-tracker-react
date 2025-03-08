import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import TextButton from "../../components/TextButton/TextButton";
import { createDataType, deleteAllDataTypes, deleteDataTypes } from "../../api"; // Make sure fetchDataTypes is imported

export default function Types() {
  const { dataTypes } = useData();

  // Define fields for the form, including the generic select field
  const formFields = [
    { name: "Name", id: "name" },
    { name: "Note", id: "note" },
    { name: "Is Complex", id: "isComplex", type: "checkbox" },
  ];

  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataType(formData); // Handle form data submission
  };

  return (
    <>
      <Heading level={1}>Data Types</Heading>
      <Divider />
      <div>
        <Form
          heading="New Type"
          fields={formFields}
          buttonText="Add New"
          handleFormData={handleFormData}
        />
        <Button onClick={deleteAllDataTypes}>Delete All</Button>
      </div>

      {dataTypes.map((cat) => (
        <p key={cat.id}>
          {cat.name}
          <br />
          <small>{cat.note}</small>
          <TextButton onClick={() => deleteDataTypes(cat.id)}>❌</TextButton>
        </p>
      ))}
    </>
  );
}
