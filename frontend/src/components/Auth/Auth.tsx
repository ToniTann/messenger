import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import userOperations from "../../../graphql/operations/user";
import { CreateUsernameData, CreateUsernameVariables } from "../../util/types";
import toast from "react-hot-toast";
interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FunctionComponent<IAuthProps> = ({
  session,
  reloadSession,
}) => {
  const [username, setUsername] = useState("");
  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameVariables
  >(userOperations.Mutations.createUsername);
  const onsubmit = async () => {
    if (!username) return;
    try {
      const { data } = await createUsername({ variables: { username } });
      if (!data?.createUsername) {
        throw new Error("here");
      }
      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data;
        throw new Error(error);
      }
      toast.success("Username successfully created!")
      console.log("Successssss")
      reloadSession()//to get new session after creating username
    } catch (error:any) {
      toast.error(error.message)
      console.log(error);
    }
  };

  return (
    <Center height="100vh">
      <Stack align={"center"} spacing={"8"}>
        {session ? (
          <>
            <Text fontSize={"3xl"}>Create username</Text>
            <Input
              placeholder="Enter a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button width={"100%"} onClick={onsubmit} isLoading={loading}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Text fontSize={"3xl"}>MessengerQL</Text>
            <Button
              onClick={(e) => {
                e.preventDefault();
                signIn("google");
              }}
              leftIcon={<Image height={"20px"} src="/Images/googlelogo.png" />}
            >
              Continue With Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
