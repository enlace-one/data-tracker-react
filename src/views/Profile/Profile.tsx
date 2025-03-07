import {
  Heading,
  Flex,
  View,
  Grid,
  Divider,
  Button,
} from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";

interface ProfileProps {
  signOut: () => void;
}

export default function Profile({ signOut }: ProfileProps) {
  const { userProfiles } = useData();

  return (
    <>
      <Heading level={1}>My Profile</Heading>
      <Divider />
      <Grid
        margin="3rem 0"
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
              {Object.entries(user).map(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "name" && <span key={key}> {`${key}: ${value}`}</span>
              )}
            </View>
            <Button onClick={signOut}>Sign Out</Button>
          </Flex>
        ))}
      </Grid>
    </>
  );
}
