import { GraphQLError } from "graphql";
import {
  ConversationPopulated,
  ConversationUpdatedSubscriptionPayload,
  GraphQLContext,
} from "../util/types";
import { Prisma, User } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../util/functions";
const resolvers = {
  Query: {
    conversations: async (
      parent: any,
      args: any,
      { session, prisma }: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      if (!session.user) {
        throw new GraphQLError("Not Authorized");
      }
      const {
        user: { id: userId },
      } = session;
      try {
        const conversations = await prisma.conversation.findMany({
          include: conversationPopulated,
        });
        return conversations.filter(
          (conv: any) =>
            !!conv.participants.find((p: any) => p.user.id === userId)
        );
      } catch (error: any) {
        console.log(error);
        throw new GraphQLError(error.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      parent: any,
      { participantIds }: { participantIds: Array<string> },
      { session, prisma, pubsub }: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      if (!session.user) {
        throw new GraphQLError("Not Authorized");
      }
      const {
        user: { id: userId },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });
        return { conversationId: conversation.id };
      } catch (error) {
        console.log(error);
        throw new GraphQLError("Error Creating Convo");
      }
    },
    markConversationAsRead: async (
      parent: any,
      { conversationId, userId }: { conversationId: string; userId: string },
      { session, prisma }: GraphQLContext
    ): Promise<boolean> => {
      if (!session.user) {
        throw new GraphQLError("Not Authorized");
      }
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });
        if (!participant) {
          throw new GraphQLError("Participant not found");
        }
        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });
      } catch (error: any) {
        console.log(error);
        throw new GraphQLError(error.message);
      }
      return true;
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, { session, pubsub }: GraphQLContext) => {
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _: any,
          { session }: GraphQLContext
        ) => {
          const {
            conversationCreated: { participants },
          } = payload;
          const userIsParticipant = !!participants.find((p: any) => {
            return p.userId === session.user.id;
          });
          return userIsParticipant;
        }
      ),
    },
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, { session, pubsub }: GraphQLContext) => {
          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: ConversationUpdatedSubscriptionPayload,
          _: any,
          { session }: GraphQLContext
        ) => {
          if (!session.user) {
            throw new GraphQLError("Not Authorized");
          }
          const {id:userId} = session.user
          const {conversationUpdated:{conversation:{participants}}} = payload
          const userIsParticipant = userIsConversationParticipant(participants , userId)
          return userIsParticipant;
        }
      ),
    },
  },
};
export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}
export const conversationParticipantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });
export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: conversationParticipantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });
export default resolvers;
