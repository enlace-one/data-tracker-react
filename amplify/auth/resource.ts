import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to Data Tracker!",
      verificationEmailBody: (createCode) =>
        `Please use this code to confirm your account: ${createCode()}`,
    },
  },
  triggers: {
    postConfirmation,
  },
});
