import {
  Heading,
  Flex,
  View,
  Grid,
  Divider,
  Button,
} from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import DateSpan from "../../components/DateSpan/DateSpan";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { useState, useEffect } from "react";
import { aboutLink, helpLink, supportLink, version } from "../../settings";
import {
  addExampleData,
  deleteProfile,
  fetchUserProfiles,
  updateProfile,
} from "../../api";
import HoverText from "../../components/HoverText/HoverText";
import { getUpdateUserProfileFields } from "../../formFields";
import FlexForm from "../../components/FlexForm/FlexForm";
import styles from "./Profile.module.css";

interface ProfileProps {
  signOut: () => void;
}

export default function Profile({ signOut }: ProfileProps) {
  const { userProfiles, setActiveTab, SETTINGS, setUserProfiles } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfiles) {
      setLoading(false);
    }
  }, [userProfiles]);

  if (loading) return <LoadingSymbol size={50} />; // Use Spinner component

  // const handleSetPreferences = () => {
  //   if (userProfiles.length === 1) {
  //     fields = getUpdateUserProfileFields(userPro);
  //   } else {
  //     console.log(`Invalid number of profiles ${userProfiles.length}`);
  //   }
  // };

  const handleFormData = async (formData: Record<string, any>) => {
    console.log("Updating profile Form Data:", formData);
    await updateProfile(formData, userProfiles[0]);
    // Upate profile
    const profiles = await fetchUserProfiles();
    setUserProfiles(profiles);
  };

  return (
    <>
      <Heading level={1}>Profile</Heading>
      <Divider />
      <Grid
        margin="0 0"
        autoFlow="column"
        justifyContent="center"
        gap="2rem"
        alignContent="center"
      >
        {userProfiles.map((user) => (
          <Flex
            key={user.id || user.email}
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap=".5rem"
            border="1px solid #ccc"
            padding="2rem 2rem 1rem 2rem"
            borderRadius="5%"
            className="box"
          >
            <View>
              <Heading level={4}>{user.email}</Heading>
              <small>
                Created: <DateSpan date={user.createdAt} />
              </small>
              <br />
              <small>
                Updated: <DateSpan date={user.updatedAt} />
              </small>
              <br />
              {SETTINGS.debug && (
                <>
                  <small>Is new: {user?.isNew}</small>
                  <Button onClick={() => deleteProfile({ id: user.id })}>
                    Delete Account
                  </Button>
                </>
              )}
              <Grid
                margin="1rem 0"
                autoFlow="column"
                justifyContent="center"
                gap="1rem"
                alignContent="center"
              >
                <Button className={styles.button} onClick={signOut}>
                  Sign Out
                </Button>
                <FlexForm
                  heading="Update Settings"
                  fields={getUpdateUserProfileFields(user)}
                  handleFormData={handleFormData}
                >
                  <Button className={styles.button}>Settings</Button>
                </FlexForm>
              </Grid>

              <Grid
                margin="1rem 0 0 0" // 👈 more vertical space between groups
                autoFlow="column"
                justifyContent="center"
                gap="1rem"
                alignContent="center"
              >
                <Button
                  className={styles.button}
                  onClick={() => addExampleData()}
                >
                  <HoverText onHoverText="Add example data">Example</HoverText>
                </Button>
                <Button
                  className={styles.button}
                  onClick={() => setActiveTab("macros")}
                >
                  Macros
                </Button>
              </Grid>

              <Grid
                margin="1rem 0"
                autoFlow="column"
                justifyContent="center"
                gap="1rem"
                alignContent="center"
              >
                <a href={helpLink} target="_blank">
                  Get Help
                </a>

                <a href={aboutLink} target="_blank">
                  About
                </a>

                <a href={supportLink} target="_blank">
                  Support us
                </a>
              </Grid>
            </View>
            <small>Version: {version}</small>
          </Flex>
        ))}
      </Grid>
    </>
  );
}
