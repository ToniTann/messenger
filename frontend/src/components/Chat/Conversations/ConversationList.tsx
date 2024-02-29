import { Box, Flex, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationModal from "./Modal/Modal";
import { useState } from "react";
import { ConversationPopulated, ParticipantPopulated } from "../../../../../backend/src/util/types";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";
type ConversationListProps = {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void;
};

const ConversationList = ({
  session,
  conversations,
  onViewConversation,
}: ConversationListProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const {
    user: { id: userId },
  } = session;
  return (
    <Box width={"100%"}>
      <Box
        py={"2"}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor={"pointer"}
        onClick={onOpen}
      >
        <Text textAlign={"center"} color={"whiteAlpha.800"} fontWeight={500}>
          Find or start a convo
        </Text>
      </Box>
      <ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
      <Flex direction={"column"} gap={2}>
        {conversations?.map((conversation) => {
          const participant  = conversation.participants.find((p:ParticipantPopulated)=>p.user.id === userId)
          return (
            <ConversationItem
              onClick={() => onViewConversation(conversation.id , participant?.hasSeenLatestMessage)}
              key={conversation.id}
              conversation={conversation}
              selectedConversationId={conversation.id}
              userId={userId}
              hasSeenLatestMessage={participant.hasSeenLatestMessage}
            />
          );
        })}
      </Flex>
    </Box>
  );
};

export default ConversationList;
