# About

Data Tracker is an application where users input data of many types on a daily basis and can see and visualize it's changes over time.

Please visit https://datatracker.enlace.one/ to sign in and try it out or https://enlace.one/ to learn more.

If you like this application, want it to be continually improved upon, or desire an iOS app for it, please consider supporting us financially at https://enlace.one/#/support-me

# Technologies Involved

**React:** A JavaScript library for building user interfaces. It allows you to create reusable components and manage the application's state efficiently.

**TypeScript:** A superset of JavaScript that adds static typing. This helps catch errors early on and improves code maintainability.

**AWS Amplify UI React:** A library of pre-built UI components that simplifies building user interfaces for AWS Amplify applications. It provides components like Loader and Placeholder used in this code. While the original code used more of these components, this revised version only uses these two for the loading state.

# Method

1. I Followed the AWS tutorial [Build a Basic Web Application with a Dynamo DB](https://aws.amazon.com/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/module-three/)
2. Then I learned about components from this [REACT video](https://www.youtube.com/watch?v=SqcY0GlETPk&t=4310s)
3. Then I decided it was about time to find a CSS strategy. I choose CSS modules because it makes some since to compartamentalize the CSS and it does not cause any hits on the performance. I see the apeal to frameworks but they have limitiations and I think knowing CSS is more valuable.
4. Then I continued building the app myself looking things up as necessary.

# Development Information

## Run the dev instance

```
npm run dev
```

```
npx ampx sandbox
```

## Set Up on New Machine
1. Clone
2. Run `npm install`
3. Run `npx ampx sandbox`
4. Run `npm run dev`

## Update Licenses

```
generate-license-file
```
