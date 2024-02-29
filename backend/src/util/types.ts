import { Prisma, PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { ISODateString } from "next-auth";
import {
  conversationParticipantPopulated,
  conversationPopulated,
} from "../resolvers/conversation";
import { Context } from "graphql-ws/lib/server";
import { messagePopulated } from "../resolvers/message";
export interface GraphQLContext {
  session: Session;
  prisma: PrismaClient;
  pubsub: PubSub;
}
export interface SubscriptionContext extends Context {
  connectionParams: {
    session: Session;
  };
}

export interface CreateUsernameResponse {
  success?: boolean;
  error?: string;
}

export interface Session {
  user: User;
  expires: ISODateString;
}
export interface User {
  id: string;
  username: string;
  email: string;
  image: string;
  name: string;
  emailVerified: boolean;
}

export interface SendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
export interface ConversationUpdatedSubscriptionPayload {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;
export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof conversationParticipantPopulated;
}>;
export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;
