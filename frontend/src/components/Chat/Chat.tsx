import { Button, Flex } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import ConversationsWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Session } from "next-auth";
import { useMemo } from "react";

interface ChatProps {
  session: Session;
}

const Chat: React.FC<ChatProps> = ({ session }) => {
  const memoizedSession = useMemo(() => session, [session]);

  return (
    <Flex height={"100vh"}>
      <ConversationsWrapper session={memoizedSession} />
      <FeedWrapper session={memoizedSession} />
      {/* <Button onClick={() => signOut()}>Logout</Button> */}
    </Flex>

  );
};

export default Chat;
