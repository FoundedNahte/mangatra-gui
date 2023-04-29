import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import Filetree from "./Filetree";
import { FileEntry, readBinaryFile } from "@tauri-apps/api/fs";
import { SyncLoader } from "react-spinners";
import logo from "../assets/mangatra_logo.png";
import Image from "next/image";

function Canvas() {
    const [blur, setBlur] = useState('0');
    const [loading, setLoading] = useState<boolean>(false);
    const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
    const [image, setImage] = useState("");
    const [selectedFileEntry, setSelectedFileEntry] = useState<FileEntry | null>(null);

    async function get_image(path) {
        if (imageCache.has(path)) {
            setLoading(false);
            setBlur('0');
            setImage(imageCache.get(path));
        } else {
            const img = await readBinaryFile(path);
            setLoading(false);
            setBlur('0');
            var data: string = Buffer.from(img).toString('base64');
            setImage(data);
            setImageCache(new Map(imageCache.set(path, data)));
        }
    }

    function get_image_element() {
        if (image == "") {
            return (
                <Image
                    src={logo}
                    alt="Mangatra Logo"
                />
            )
        } else {
            return (
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
            )
        }
    }

    useEffect(() => {
        // Check if file entry is a dir or image file
        if (selectedFileEntry != null && selectedFileEntry.children == null) {
            setBlur('3');
            setLoading(true);
            get_image(selectedFileEntry.path);
        }
    }, [selectedFileEntry])

    return (
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
                    <Filetree
                        onSelection={(entry) => setSelectedFileEntry(entry)}
                        resetImageCache={() => setImageCache(new Map())}
                    />
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
                        <Stack p="12" spacing={0}>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                    <Textarea variant="outline" resize="none"></Textarea>
                                </Flex>
                            </Box>
                        </Stack>
                    </Box>
                </GridItem>
            </Grid>
        </Box >
    );
}

export default Canvas;