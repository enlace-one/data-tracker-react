import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import { createDataCategory, deleteDataCategory } from "../../api"; // Make sure fetchDataTypes is imported
import TextButton from "../../components/TextButton/TextButton";

export default function Categories() {
  const { dataCategories, dataTypes } = useData();

  // Map fetched DataTypes to options for the select field
  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  // Define fields for the form, including the generic select field
  const formFields = [
    { name: "Name", id: "name", required: true },
    { name: "Note", id: "note" },
    { name: "Add Default", id: "addDefault", type: "checkbox" },
    { name: "Default Value", id: "defaultValue" },
    {
      name: "Data Type",
      id: "dataTypeId",
      type: "select",
      options: dataTypeOptions,
      required: true,
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

      <table>
        <tbody>
          {dataCategories.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name}{" "}
                <small>
                  ({/* {item.dataType.name} */}
                  {dataTypes
                    .filter((dt) => dt.id === item.dataTypeId)
                    .map((dt) => dt.name)
                    .join(", ")}
                  )
                </small>
                <br />
                <small>
                  {item.note}{" "}
                  {item.addDefault && `(Default: ${item.defaultValue})`}
                </small>
              </td>
              <td>
                <TextButton onClick={() => deleteDataCategory(item.id)}>
                  ❌
                </TextButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
