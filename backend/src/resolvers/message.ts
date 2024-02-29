import { Prisma } from "@prisma/client";
import {
  GraphQLContext,
  MessagePopulated,
  MessageSentSubscriptionPayload,
  SendMessageArguments,
} from "../util/types";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../util/functions";
import { conversationPopulated } from "./conversation";

const resolvers = {
  Query: {
    messages: async (
      parent: any,
      { conversationId }: { conversationId: string },
      { session, prisma }: GraphQLContext
    ): Promise<Array<MessagePopulated>> => {
      if (!session.user) {
        throw new GraphQLError("Not Authorized");
      }
      const {
        user: { id: userId },
      } = session;
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });

      if (!conversation) {
        throw new GraphQLError("Conversation not found");
      }
      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );
      if (!allowedToView) {
        throw new GraphQLError("Not Authorized");
      }
      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });
        return messages;
      } catch (error: any) {
        console.log(error);
        throw new GraphQLError(error.message);
      }
      return [];
    },
  },
  Mutation: {
    sendMessage: async (
      parent: any,
      { id: messageId, senderId, conversationId, body }: SendMessageArguments,
      { session, prisma, pubsub }: GraphQLContext
    ): Promise<boolean> => {
      const {
        user: { id: userId },
      } = session;
      if (!session.user) {
        throw new GraphQLError("Not Authorized");
      }
      if (userId !== senderId) {
        throw new GraphQLError("Not Authorized");
      }
      try {
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });

        if (!participant) {
          throw new GraphQLError("No participant found");
        }

        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: participant.id
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  conversationId,
                  NOT: {
                    userId
                  },
                },
                data: {
                  hasSeenLatestMessage:false
                },
              },
            },
          },
          include:conversationPopulated
        });
        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        pubsub.publish("CONVERSATION_UPDATED", {
          conversationUpdated: { conversation },
        });
      } catch (error) {
        console.log(error);
        throw new GraphQLError("Error sending message");
      }

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, { pubsub }: GraphQLContext) => {
          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (
          payload: MessageSentSubscriptionPayload,
          args: { conversationId: string },
          context: GraphQLContext
        ) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};
export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});
export default resolvers;
