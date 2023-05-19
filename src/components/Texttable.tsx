import { memo, useState, useEffect, useCallback } from "react";
import update from 'immutability-helper';
import type { FC } from "react";
import {
    Stack,
} from '@chakra-ui/react';
import TextPair from "./TextPair";
import { v4 as uuidv4 } from 'uuid';
import { useDrop } from 'react-dnd';
import { text } from "stream/consumers";
import { textPair } from "./Canvas";

export const ItemTypes = {
    TEXT_PAIR: "textPair",
}

function Texttable({ focused, imageCache, setImageCache }) {
    const [textPairs, setTextPairs] = useState(focused !== null ? imageCache.get(focused.name).text.textPairs : []);

    const moveTextPair = useCallback((oldIndex: number, newIndex: number) => {
        console.log(oldIndex, newIndex);
        let oldTextPair = textPairs[oldIndex];
        setTextPairs(
            update(textPairs, {
                $splice: [
                    [oldIndex, 1],
                    [newIndex, 0, oldTextPair],
                ],
            }),
        );
    }, [textPairs, setTextPairs]);

    const handleTextChange = useCallback((newInput, index, isOriginalText) => {
        textPairs[index][isOriginalText ? 0 : 1] = newInput;
        setTextPairs(textPairs);
    }, [textPairs, setTextPairs]);

    useEffect(() => {
        if (focused !== null) {
            setTextPairs(imageCache.get(focused.name).text.textPairs);
        }

        if (imageCache !== null && focused !== null) {
            console.log(imageCache.get(focused));
        }
    }, [focused, imageCache])

    useEffect(() => {
        if (focused !== null) {
            imageCache.get(focused.name).text.textPairs = textPairs;
            setImageCache(imageCache);
        }
        if (textPairs !== null) {
            console.log(textPairs);
        }
    }, [textPairs])

    return (
        <Stack py="12" spacing={0}>
            {textPairs !== null
                && focused !== null
                && textPairs.map((pair, index) => (
                    <TextPair
                        key={uuidv4()}
                        textPair={pair}
                        focused={focused}
                        index={index}
                        moveTextPair={moveTextPair}
                        handleTextChange={handleTextChange}
                    />
                ))
            }
        </Stack>
    );
}

export default Texttable;