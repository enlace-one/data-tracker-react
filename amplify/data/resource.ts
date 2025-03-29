/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

const schema = a
  .schema({
    UserProfile: a
      .model({
        email: a.string().required(),
        profileOwner: a.string(),
      })
      .secondaryIndexes((index) => [index("email")])
      .authorization((allow) => [
        allow.owner(),
        allow.ownerDefinedIn("profileOwner"),
        allow.groups(["Admins"]).to(["read"]),
      ]),
    DataType: a
      .model({
        name: a.string().required(),
        note: a.string(),
        inputType: a.string().required(),
        isComplex: a.boolean().required(),
        dataCategories: a.hasMany("DataCategory", "dataTypeId"),
      })
      .secondaryIndexes((index) => [index("name")])
      .authorization((allow) => [allow.owner()]),
    DataCategory: a
      .model({
        name: a.string().required(),
        note: a.string(),
        addDefault: a.boolean().required(),
        defaultValue: a.string(),
        options: a.string().array(), // For future use with options of values
        dataEntries: a.hasMany("DataEntry", "dataCategoryId"),
        dataTypeId: a.id().required(), // ✅ Explicitly define the reference field
        dataType: a.belongsTo("DataType", "dataTypeId"),
        entryCount: a.integer().default(0),
      })
      .secondaryIndexes((index) => [index("name")])
      .authorization((allow) => [
        allow.owner(),
        allow.groups(["Admins"]).to(["read"]),
        // allow.publicApiKey(), // TODO: Remove. FOR TESTING
      ]),
    DataEntry: a
      .model({
        note: a.string(),
        category: a.belongsTo("DataCategory", "dataCategoryId"),
        dataCategoryId: a.id().required(),
        date: a.date().required(),
        value: a.string().required(),
        dummy: a.integer().default(0),
      })
      .secondaryIndexes((index) => [
        index("dataCategoryId")
          .name("categoryEntriesByDate")
          .queryField("listCategoryEntries")
          .sortKeys(["date"]),
        index("dummy")
          .name("entriesByDate")
          .queryField("listByDate")
          .sortKeys(["date"]),
      ])
      // client.models.DataEntry.listDataentryByDataCategoryId({dataCategoryId: "ID"})
      .authorization((allow) => [
        allow.owner(),
        allow.groups(["Admins"]).to(["read"]),
        // allow.publicApiKey(), // TODO: Remove. FOR TESTING
      ]),
  })
  .authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

// Apply Schema to the model
// export const schema: Schema = schema;

// export const schema = schema;
export { schema };

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // Changed from public api key. https://docs.amplify.aws/react/build-a-backend/data/customize-authz/
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
  // authorizationModes: {
  //   defaultAuthorizationMode: "userPools",
  //   apiKeyAuthorizationMode: {
  //     expiresInDays: 30,
  //   },
  // },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
