import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
    Box,
    Flex,
    Grid,
    GridItem,
    Image,
    Spacer,
    Textarea,
    Button,
    Center,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Container,
    Stack
} from "@chakra-ui/react";
import Filetree from "./Filetree";

function Canvas() {
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    async function get_image() {
        setImage(await invoke("get_image", { name }));
    }

    return (
        <Box w="100%" h="100%" bgColor="#212121">
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
                color='blackAlpha.700'
                fontWeight='bold'
                overflow="hidden"
            >
                <GridItem bg='orange.300' area={'nav'}>
                    <Filetree />
                </GridItem>
                <GridItem pl='2' bg='green.300' area={'toolbar'}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            get_image();
                        }}
                    >
                        <Textarea
                            id="greet-input"
                            onChange={(e) => setName(e.currentTarget.value)}
                            placeholder="Enter a path..."
                        />
                        <button>Get</button>
                    </form>
                </GridItem>
                <GridItem p="4" bg='blue.300' area={'main'}>
                    <Center w="100%" h="100%">
                        <Flex p="4" w="90%" h="100%">
                            <Box w="49.5%" h="100%" bg='blue.300'>
                                <Image h="100%" w="100%" objectFit="contain" boxSize="100%" src={`data:image/jpeg;base64,${image}`} />
                            </Box>
                            <Spacer />
                            <Box w="49.5%" h="100%" bg='blue.300'>
                                <Image h="100%" w="100%" objectFit="contain" boxSize="100%" src={`data:image/jpeg;base64,${image}`} />
                            </Box>
                        </Flex>
                    </Center>
                </GridItem>
                <GridItem pl='2' bg='purple.300' area={'text'} overflowY="scroll">
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