import { useState, useEffect, memo } from "react";
import {
    Box,
    IconButton,
    Flex,
    Textarea,
    Divider,
    Center
} from '@chakra-ui/react';
import { RxDragHandleHorizontal } from 'react-icons/rx';
import { MdDragIndicator } from 'react-icons/md';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './Texttable';

interface TextItem {
    id: number
}

// Component for text pair card in the text editor
function TextPair({ textPair, focused, index, moveTextPair, handleTextChange }) {

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TEXT_PAIR,
        item: { index },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const didDrop = monitor.didDrop();
            if (!didDrop) {
                moveTextPair(index, item.id);
            }
        }
    }), [index, moveTextPair])

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.TEXT_PAIR,
        hover({ id: draggedIndex }: TextItem) {
            if (draggedIndex !== index) {
                moveTextPair(draggedIndex, index);
            }
        }
    }), [index, moveTextPair])



    return (
        <Box sx={{
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move',
        }} px="16" position="relative" ref={(node) => drag(drop(node))}>

            <Flex alignContent="center" margin="auto" p="auto">
                <Textarea
                    variant="outline"
                    resize="none"
                    defaultValue={textPair[0]}
                    onChange={(e) => handleTextChange(e.target.value, index, true)}
                />
                <Center>
                    <MdDragIndicator />
                </Center>
                <Textarea
                    variant="outline"
                    resize="none"
                    defaultValue={textPair[1]}
                    onChange={(e) => handleTextChange(e.target.value, index, false)}
                />
            </Flex>
        </Box>
    );
}

export default TextPair;

/*
<IconButton
                position="absolute"
                left="-0.05%"
                top="25%"
                marginY="auto"
                colorScheme="red"
                aria-label="Delete"
                icon={<RxDragHandleHorizontal />}
            />
            */