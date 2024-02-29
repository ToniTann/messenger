import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date
  type Mutation {
    createConversation(participantIds: [String]): CreateConversationResponse
    markConversationAsRead(userId: String, conversationId: String): Boolean
  }
  type Conversation {
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }
  type Query {
    conversations: [Conversation]
  }
  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }
  type CreateConversationResponse {
    conversationId: String
  }
  type ConversationUpdatedSubscriptionPayload {
    conversation: Conversation
  }
  type Subscription {
    conversationCreated: Conversation
    conversationUpdated: ConversationUpdatedSubscriptionPayload
  }
`;

export default typeDefs;
