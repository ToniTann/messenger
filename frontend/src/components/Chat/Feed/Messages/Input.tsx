import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ObjectId } from "bson";
import MessageOperations from "../../../../../graphql/operations/message";
import { SendMessageArguments } from "../../../../../../backend/src/util/types";
import { MessagesData } from "../../../../util/types";
type MessageInputProps = {
  session: Session;
  conversationId: string;
};

const MessageInput = ({ session, conversationId }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    SendMessageArguments
  >(MessageOperations.Mutation.sendMessage);
  const onSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { id: senderId } = session.user;
      const messageId = new ObjectId().toString();
      console.log(messageId)
      const newMessage: SendMessageArguments = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };
       setMessageBody("");
      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
        },
        optimisticResponse:{
          sendMessage:true
        },
        update:(cache)=>{
          const existing = cache.readQuery<MessagesData>({
            query:MessageOperations.Query.messages,
            variables:{conversationId}
          })
          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  ...newMessage,
                  sender:{
                    id:session.user.id,
                    username:session.user.username
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing?.messages,
              ],
            },
          });
        }
      });
     
      if (!data.sendMessage || errors) {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <Box px={4} py={6} width={"100%"}>
      <form onSubmit={onSendMessage}>
        <Input
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="New Message"
          size={"md"}
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};

export default MessageInput;
