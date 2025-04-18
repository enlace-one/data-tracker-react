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
import { helpLink, version } from "../../settings";
import { addExampleData } from "../../api";
import HoverText from "../../components/HoverText/HoverText";

interface ProfileProps {
  signOut: () => void;
}

export default function Profile({ signOut }: ProfileProps) {
  const { userProfiles, setActiveTab } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfiles) {
      setLoading(false);
    }
  }, [userProfiles]);

  if (loading) return <LoadingSymbol size={50} />; // Use Spinner component

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
            gap="2rem"
            border="1px solid #ccc"
            padding="2rem"
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

              {/* {Object.entries(user).map(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "name" && <span key={key}> {`${key}: ${value}`}</span>
              )} */}
            </View>
          </Flex>
        ))}
      </Grid>

      <a href={helpLink} target="_blank">
        Get Help
      </a>
      <small>Version: {version}</small>

      <Grid
        margin="0 0"
        autoFlow="column"
        justifyContent="center"
        gap="1rem"
        alignContent="center"
      >
        <Button onClick={signOut}>Sign Out</Button>
        <Button onClick={() => addExampleData()}>
          <HoverText onHoverText="Add example data">Example</HoverText>
        </Button>
      </Grid>
      <Grid
        margin="0 0"
        autoFlow="column"
        justifyContent="center"
        gap="1rem"
        alignContent="center"
      >
        <Button onClick={() => setActiveTab("macros")}>Macros</Button>
      </Grid>
    </>
  );
}
