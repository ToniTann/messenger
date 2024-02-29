import {
  Button,
  CloseButton,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import userOperations from "../../../../../graphql/operations/user";
import conversationOperations from "../../../../../graphql/operations/conversation";
import { CreateConversationData, CreateConversationInput, SearchUsersData, SearchUsersInput, SearchedUser } from "../../../../util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  session:Session
};

const ConversationModal = ({ isOpen, onClose,session }: ModalProps) => {
    const {user:{id:userId}}=session
    const router = useRouter()
  const [username, setUsername] = useState("");
  const [participants , setParticipants] = useState<Array<SearchedUser>>([])
  const [searchUsers, { data, error, loading }] = useLazyQuery<
    SearchUsersData,
    SearchUsersInput
  >(userOperations.Queries.searchUsers);
  const [createConversation, { loading: createConversationLoading }] = useMutation<CreateConversationData , CreateConversationInput>(
    conversationOperations.Mutations.createConversation
  );
  console.log('Data',data)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchUsers({variables:{username}})
  };
  const addParticipant = (user:SearchedUser)=>{
    setParticipants(prev=>[...prev , user])
    setUsername("")
  }
  const removeParticipant = (userID:string)=>{
    setParticipants(prev=>prev.filter(p=>p.id!==userID))
    setUsername("")
  }
  const onCreateConvo = async ()=>{

    const participantIds = [...participants.map(p=>p.id) , userId]

    try {
        const {data} = await createConversation({variables:{participantIds}})
        console.log(data)
        if(!data?.createConversation){
            throw new Error("Failed to create convo")
        }
        const {
          createConversation: { conversationId },
        } = data;
        router.push({query:{conversationId}})
        setParticipants([])
        setUsername('')
        onClose()
    } catch (error:any) {
        console.log(error)
        toast.error(error.message)
    }
  }
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={"#2d2d2d"} pb={4}>
          <ModalHeader>Create New Convo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={(e) => onSubmit(e)}>
              <Stack>
                <Input
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />

                <Button
                  type="submit"
                  isDisabled={!username}
                  isLoading={loading}
                >
                  Search
                </Button>
              </Stack>
            </form>
            {data?.searchUsers && (
              <UserSearchList
                users={data.searchUsers}
                addParticipant={addParticipant}
              />
            )}
            {participants.length !== 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipant={removeParticipant}
                />
                <Button
                  bg={"brand.100"}
                  width={"100%"}
                  mt={6}
                  _hover={{ bg: "brand.100" }}
                  onClick={onCreateConvo}
                  isLoading={createConversationLoading}
                >
                  Create Convo
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConversationModal;
