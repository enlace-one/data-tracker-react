import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to Data Tracker!",
      verificationEmailBody: (createCode) =>
        `Hello,

      Welcome to Data Tracker! 
      Please use this code to confirm your account: ${createCode()}
      
      Best Regards, 
      Enlace Team
      https://enlace.one/`,
    },
  },
  triggers: {
    postConfirmation,
  },
});
