import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import {
  MessageSubscriptionData,
  MessagesData,
  MessagesVariables,
} from "../../../../util/types";
import MessageOperations from "../../../../../graphql/operations/message";
import toast from "react-hot-toast";
import SkeletonLoadder from "../../../common/SkeletonLoadder";
import MessageItem from "./MessageItem";
type MessagesProps = {
  userId: string;
  conversationId: string;
};

const Messages = ({ userId, conversationId }: MessagesProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(MessageOperations.Query.messages, {
    variables: { conversationId },
    fetchPolicy: "cache-and-network",
    onError: ({ message }) => {
      toast.error(message);
    },
  });
 
  console.log(data, "mess");
  let unsubb = null;
  const subscribeToNewMessages = async (conversationId: string) => {
    const unsub = subscribeToMore({
      document: MessageOperations.Subscription.messageSent,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData) {
          return prev;
        }
        const newMessage = subscriptionData.data.messageSent;
        return Object.assign({}, prev, {
          messages:newMessage.sender.id === userId ? prev.messages :[newMessage, ...prev.messages],
        });
      },
    });
    unsubb = unsub;
  };
  useEffect(() => {
    subscribeToNewMessages(conversationId);
    console.log(`subbing to ${conversationId}`);
    return () => unsubb();
  }, [conversationId]);
   if (error) {
     return null;
   }
  return (
    <Flex direction={"column"} justify={"flex-end"} overflow={"hidden"}>
      {loading && !data && (
        <Stack spacing={4} px={4}>
          <SkeletonLoadder count={4} height="60px" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction={"column-reverse"} overflowY={"scroll"} height={"100%"}>
          {data?.messages.map((message) => (
            <MessageItem key={message.id} message={message} sentByMe={message.sender.id === userId}/>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
