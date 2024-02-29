import React from "react";
import { SearchedUser } from "../../../../util/types";
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
type UserSearchListProps = {
  users: Array<SearchedUser>;
  addParticipant: (user: SearchedUser) => void;
};

const UserSearchList = ({ users, addParticipant }: UserSearchListProps) => {
  return (
    <>
      {users.length === 0 ? (
        <Flex mt={6} justify={"center"}>
          <Text>No users found</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {users.map((user) => (
            <Stack
              key={user.id}
              direction={"row"}
              align={"center"}
              spacing={4}
              py={2}
              px={4}
              borderRadius={4}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Avatar />
              <Flex
                width={"100%"}
                justifyContent="space-between"
                align={"center"}
              >
                <Text color={"whiteAlpha.700"}>{user.username}</Text>
                <Button bg={"brand.100"} onClick={() => {addParticipant(user)}}>
                  Select
                </Button>
              </Flex>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};

export default UserSearchList;
