// Credit to react-arborist

import React, { ReactElement } from "react";
import mergeRefs from "./merge-refs";
import { Box, Flex } from "@chakra-ui/react";
import useResizeObserver from "use-resize-observer";

type Props = {
    children: (dimens: { width: number; height: number }) => ReactElement;
};

const style = {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: 0,
    minWidth: 0,
};

export const FillFlexParent = React.forwardRef(function FillFlexParent(
    props: Props,
    forwardRef
) {
    const { ref, width, height } = useResizeObserver();
    return (
        <Flex minWidth="150px" minHeight="100%" w="500px" h="100%" ref={mergeRefs(ref, forwardRef)}>
            {width && height ? props.children({ width, height }) : null}
        </Flex>
    );
});
