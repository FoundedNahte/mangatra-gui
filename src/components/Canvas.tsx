import { useState, useEffect, createContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
    Box,
    Flex,
    Grid,
    GridItem,
    Image as ChakraImage,
    Spacer,
    Textarea,
    Center,
    Stack,
    Editable,
    EditableTextarea
} from "@chakra-ui/react";
import Filetree from "./Filetree";
import { FileEntry, readBinaryFile } from "@tauri-apps/api/fs";
import { SyncLoader } from "react-spinners";
import logo from "../assets/mangatra_logo.png";
import Image from "next/image";
import Texttable from "./Texttable";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export type textPair = [string, string];

type textStruct = {
    textName: string,
    textPath: string,
    textPairs: textPair[],
}

type imageStruct = {
    imageData: string,
    imagePath: string,
    text: textStruct,
    modified: boolean,
}

export const CanvasContext = createContext(null);

function Canvas() {
    const [blur, setBlur] = useState('0');
    const [loading, setLoading] = useState<boolean>(false);
    const [imageTree, setImageTree] = useState<FileEntry[]>([]);
    const [imageCache, setImageCache] = useState<Map<string, imageStruct>>(new Map());
    const [image, setImage] = useState("");
    const [selectedFileEntry, setSelectedFileEntry] = useState<FileEntry | null>(null);
    const [fileMode, setFileMode] = useState<string>("Images");
    const [focused, setFocused] = useState<FileEntry | null>(null);
    const [reload, setReload] = useState("");

    async function get_image(path) {
        const fileName: string = await invoke("get_file_name", { path: path });

        if (imageCache.get(fileName).imageData !== null) {
            setLoading(false);
            setBlur('0');
            setImage(imageCache.get(fileName).imageData);
        } else {
            const img = await readBinaryFile(path);
            setLoading(false);
            setBlur('0');

            const data: string = Buffer.from(img).toString('base64');

            setImage(data);
            setImageCache(new Map(imageCache.set(fileName, {
                imageData: data,
                imagePath: path,
                text: {
                    textName: imageCache.get(fileName).text.textName,
                    textPath: imageCache.get(fileName).text.textPath,
                    textPairs: imageCache.get(fileName).text.textPairs,
                },
                modified: true,
            })));
        }
    }

    function handleTextChange(newInput, index, originalText) {

    }

    useEffect(() => {
        // Check if file entry is a dir or image file
        if (selectedFileEntry != null && selectedFileEntry.children == null) {
            setBlur('3');
            setLoading(true);
            get_image(selectedFileEntry.path);
        }
    }, [selectedFileEntry])

    useEffect(() => {
        setReload("");
    }, [focused, imageCache])

    return (
        <DndProvider backend={HTML5Backend}>
            <Box w="100%" h="100%" bgColor="#ff6700">
                <Grid
                    templateAreas={`"nav toolbar" 
                                "nav main"
                                "nav main"
                                "nav text"`}
                    gridTemplateRows={'0.1fr 0.94fr 0.6fr 0.50fr'}
                    gridTemplateColumns={'250px 1fr'}
                    h='100vh'
                    w='100vw'
                    gap='1'
                    color='white'
                    fontWeight='bold'
                    overflow="hidden"
                >
                    <GridItem bg='#323232' area={'nav'}>
                        <CanvasContext.Provider value={{
                            imageCache,
                            setImageCache,
                            imageTree,
                            setImageTree,
                            fileMode,
                            setFileMode,
                            focused,
                            setFocused
                        }}>
                            <Filetree
                                onSelection={(entry) => setSelectedFileEntry(entry)}
                                resetImageCache={() => setImageCache(new Map())}
                            />
                        </CanvasContext.Provider>
                    </GridItem>
                    <GridItem pl='2' bg='#323232' area={'toolbar'}>
                    </GridItem>
                    <GridItem p="4" bg='#6a6a6a' area={'main'}>
                        {image == "" ?
                            <Center w="100%" h="100%">
                                <SyncLoader cssOverride={{
                                    zIndex: "1",
                                    position: "absolute",
                                }} color="#ff6700" loading={loading} size={30} />
                                <Box sx={{ filter: "blur(".concat(blur, "px", ")") }}>
                                    <Image src={logo} alt="Mangatra Logo" />
                                </Box>
                            </Center>
                            :
                            <Center w="100%" h="100%">
                                <SyncLoader cssOverride={{
                                    zIndex: "1",
                                    position: "absolute",
                                }} color="#ff6700" loading={loading} size={30} />
                                <Flex sx={{ filter: "blur(".concat(blur, "px", ")") }} p="4" w="90%" h="100%">
                                    <Box w="49.5%" h="100%" bg='#6a6a6a'>

                                        <ChakraImage
                                            h="100%"
                                            w="100%"
                                            objectFit="contain"
                                            boxSize="100%"
                                            src={`data:image/jpeg;base64,${image}`}
                                        />
                                    </Box>
                                    <Spacer />
                                    <Box w="49.5%" h="100%" bg='#6a6a6a'>
                                        <ChakraImage
                                            h="100%"
                                            w="100%"
                                            objectFit="contain"
                                            boxSize="100%"
                                            src={`data:image/jpeg;base64,${image}`}
                                        />
                                    </Box>
                                </Flex>
                            </Center>
                        }
                    </GridItem>
                    <GridItem sx={{
                        "scrollbar-width": "thin",
                        "::-webkit-scrollbar": {
                            display: "none"
                        },
                    }} pl='2' bg='#323232' area={'text'} overflowY="scroll">
                        <Box w="100%" h="100%">
                            <Texttable
                                focused={focused}
                                imageCache={imageCache}
                                setImageCache={setImageCache}
                            />
                        </Box>
                    </GridItem >
                </Grid >
            </Box >
        </DndProvider>
    );
}

export default Canvas;