import { Box } from "@chakra-ui/react";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../../graphql/operations/conversation";
import {  ConversationUpdatedData, ConversationsData } from "../../../util/types";
import { ConversationPopulated, ParticipantPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoadder from "../../common/SkeletonLoadder";
import toast from "react-hot-toast";
type ConversationsWrapperProps = {
  session: Session;
};

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
  const {user:{id:userId}} = session
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);
  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: Boolean },
    { userId: String; conversationId: String }
  >(ConversationOperations.Mutations.markConversationAsRead);
  useSubscription<ConversationUpdatedData>(ConversationOperations.Subscriptions.conversationUpdated,{onData:({client , data})=>{
    const {data:subscriptionData} = data
    console.log("Fire Fire" , subscriptionData)
    if(!subscriptionData) return
    const {conversationUpdated:{conversation:updatedConversation}} = subscriptionData;
    const currentlyViewingConversation = updatedConversation.id === conversationId
    if(currentlyViewingConversation){
      onViewConversation(conversationId as string , false)
    }

  }})
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;
  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => {
    router.push({ query: { conversationId } });
    if(hasSeenLatestMessage){
      return
    }
    try {
      await markConversationAsRead({
        variables: { userId, conversationId },
        optimisticResponse: {
          markConversationAsRead:true
        },
        update:(cache)=>{
          const participantsFragment = cache.readFragment<{ participants:Array<ParticipantPopulated> }>({
            id:`Conversation:${conversationId}`,
            fragment:gql`
              fragment Participants on Conversation {
                participants {
                  user{
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `
          })
          if(!participantsFragment) return
          const participants = [...participantsFragment.participants]
          const userParticipantIdx = participants.findIndex(p=>p.user.id === userId)
          if(userParticipantIdx === -1) return
          const userParticipant = participants[userParticipantIdx];
          participants[userParticipantIdx] = {
            ...userParticipant , 
            hasSeenLatestMessage:true
          }
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdateParticipants on Conversation {
                participants 
              }
            `,
            data: {
              participants,
            },
          });
        }
      });
    } catch (error) {
      console.log(error)
      toast.error(error)
    }
  };
  useEffect(() => {
    const subscribeToNewConversations = () => {
      subscribeToMore({
        document: ConversationOperations.Subscriptions.conversationCreated,
        updateQuery: (
          prev,
          {
            subscriptionData,
          }: {
            subscriptionData: {
              data: { conversationCreated: ConversationPopulated };
            };
          }
        ) => {
          if (!subscriptionData.data) {
            return prev;
          }
          const newConvo = subscriptionData.data.conversationCreated;
          console.log(newConvo, 222222);
          return Object.assign({}, prev, {
            conversations: [newConvo, ...prev.conversations],
          });
        },
      });
    };
    subscribeToNewConversations();
    console.log("subbed");
  }, []);
  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      flexDirection={"column"}
      gap={4}
      bg="whiteAlpha.50"
      py={"6"}
      px={"3"}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      overflowY={"scroll"}
    >
      {conversationsLoading ? (
        <SkeletonLoadder count={7} height="80px" />
      ) : (
        <ConversationList
          onViewConversation={onViewConversation}
          session={session}
          conversations={conversationsData!?.conversations}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
