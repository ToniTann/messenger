import { Skeleton } from "@chakra-ui/react";
import React from "react";

type SkeletonLoadderProps = {
  count: number;
  height: string;
  width?: string;
};

function SkeletonLoadder({ count, height, width }: SkeletonLoadderProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Skeleton
          key={index}
       
          startColor="blackAlpha.400"
          endColor="whiteAlpha.400"
          height={height}
          width={{base:"full"}}
          borderRadius={4}
        />
      ))}
    </>
  );
}

export default SkeletonLoadder;
