import { gql } from "@apollo/client";
const conversationFields = `

    id
    participants {
    user {
        id
        username
    }
    hasSeenLatestMessage
    }
    latestMessage {
    id
    sender {
        id
        username
    }
    body
    createdAt
    }
    updatedAt

`;
export default {
  Queries: {
    conversations: gql`
      query Conversations {
        conversations{
          ${conversationFields}
        }
      }
    `,
  },
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantIds: [String]!) {
        createConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $conversationId: String
        $userId: String
      ) {
        markConversationAsRead(conversationId: $conversationId, userId: $userId)
      }
    `,
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated{
          ${conversationFields}
        }
      }
    `,
    conversationUpdated: gql`
      subscription ConversationUpdated {
        conversationUpdated{
          conversation{
            ${conversationFields}
          }
        }
      }
    `,
  },
};
