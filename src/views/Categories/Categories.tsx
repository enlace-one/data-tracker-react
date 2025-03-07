import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import { createDataCategory } from "../../api"; // Make sure fetchDataTypes is imported

export default function Categories() {
  const { dataCategories, dataTypes } = useData();

  // Map fetched DataTypes to options for the select field
  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  // Define fields for the form, including the generic select field
  const formFields = [
    { name: "Name", id: "name" },
    { name: "Note", id: "note" },
    { name: "Add Default", id: "addDefault", type: "checkbox" },
    { name: "Default Value", id: "defaultValue" },
    {
      name: "Data Type",
      id: "dataType",
      type: "select",
      options: dataTypeOptions,
    },
  ];

  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataCategory(formData); // Handle form data submission
  };

  return (
    <>
      <Heading level={1}>Data Categories</Heading>
      <Divider />
      <Form
        heading="New Category"
        fields={formFields}
        buttonText="Add New"
        handleFormData={handleFormData}
      />

      {dataCategories.map((cat) => (
        <p key={cat.id}>
          {cat.name}
          <br />
          <small>{cat.note}</small>
        </p>
      ))}
    </>
  );
}
