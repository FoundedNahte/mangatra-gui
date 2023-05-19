import { FC, ReactNode } from 'react';
import {
    Box
} from '@chakra-ui/react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './Texttable';

export interface DragAreaProps {
    index: number
    children?: ReactNode
}

function DragArea({
    index,
    children
}: DragAreaProps) {
    return (
        <Box>

        </Box>
    );
}