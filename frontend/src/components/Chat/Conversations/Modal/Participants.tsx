import React from "react";
import { SearchedUser } from "../../../../util/types";
import { Flex, Stack, Text } from "@chakra-ui/react";
import {IoIosCloseCircleOutline} from 'react-icons/io'
type ParticipantsProps = {
  participants: Array<SearchedUser>;
  removeParticipant: (userId: string) => void;
};

const Participants = ({
  participants,
  removeParticipant,
}: ParticipantsProps) => {
  return (
    <Flex mt={8} gap="10px" flexWrap={'wrap'}>
      {participants.map((p) => (
        <Stack direction={"row"} key={p.id} align={'center'} bg='whiteAlpha.200' borderRadius={4} p={2}>
            <Text>{p.username}</Text>
            <IoIosCloseCircleOutline size={20} cursor={'pointer'} onClick={()=>removeParticipant(p.id)}/>
        </Stack>
      ))}
    </Flex>
  );
};

export default Participants;
