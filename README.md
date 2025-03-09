# Method

1. I Followed the AWS tutorial [Build a Basic Web Application with a Dynamo DB](https://aws.amazon.com/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/module-three/)
2. Then I learned about components from this [REACT video](https://www.youtube.com/watch?v=SqcY0GlETPk&t=4310s)
3. Then I decided it was about time to find a CSS strategy. I choose CSS modules because it makes some since to compartamentalize the CSS and it does not cause any hits on the performance. I see the apeal to frameworks but they have limitiations and I think knowing CSS is more valuable.

# Development Information

Run the dev instance:

```
npm run dev
```

```
npx ampx sandbox
```

# Technologies Involved

**React:** A JavaScript library for building user interfaces. It allows you to create reusable components and manage the application's state efficiently.

**TypeScript:** A superset of JavaScript that adds static typing. This helps catch errors early on and improves code maintainability.

**AWS Amplify UI React:** A library of pre-built UI components that simplifies building user interfaces for AWS Amplify applications. It provides components like Loader and Placeholder used in this code. While the original code used more of these components, this revised version only uses these two for the loading state.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
