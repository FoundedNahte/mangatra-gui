import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    IconButton,
    Stack,
    Text,
    Container,
    Spacer,
    HStack,
    Icon
} from '@chakra-ui/react';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { readDir, readBinaryFile, FileEntry } from '@tauri-apps/api/fs';
import { NodeApi, NodeRendererProps, Tree, TreeApi } from 'react-arborist';
import { FillFlexParent } from './fill-flex-parent';
import useResizeObserver from 'use-resize-observer';
import { IoImageOutline } from 'react-icons/io5';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { AiFillFolder } from 'react-icons/ai';

type treeDimensions = { width: number; height: number };

function Filetree() {
    const [tree, setTree] = useState<TreeApi<FileEntry> | null | undefined>(null);
    const [treeDimens, setTreeDimens] = useState<treeDimensions>({ width: 0, height: 0 });
    const [directories, setDirectories] = useState<FileEntry[]>([]);
    const [filePaths, setFilePaths] = useState<string[]>([]);
    const [active, setActive] = useState<FileEntry | null>(null);
    const [focused, setFocused] = useState<FileEntry | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCount, setSelectedCount] = useState(0);
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    async function selectImageDirectory() {
        const dir = await open({
            directory: true,
            recursive: true
        }) as string;

        let entries = await readDir(dir, { recursive: true });
        let file_tree = JSON.stringify(entries);

        invoke("filter_tree", { fileTree: file_tree, images: true })
            .then((result) => setDirectories(JSON.parse<FileEntry[]>(result)))
            .catch((error) => console.error(error));
    }

    async function selectImageFile() {
        setFilePaths(await open({
            multiple: true,
            filters: [{
                name: 'Image',
                extensions: ['png', 'jpg', 'jpeg', 'webp']
            }]
        }) as string[]);
    }

    async function selectTextDirectory() {
        const dir = await open({
            directory: true,
            recursive: true
        }) as string;

        let entries = await readDir(dir, { recursive: true });
        let file_tree = JSON.stringify(entries);

        invoke("filter_tree", { fileTree: file_tree, images: false })
            .then((result) => setDirectories(JSON.parse<FileEntry[]>(result)))
            .catch((error) => console.error(error));
    }

    async function selectTextFile() {
        setFilePaths(await open({
            multiple: true,
            filters: [{
                name: 'Text',
                extensions: ['json']
            }]
        }) as string[]);
    }

    useEffect(() => {
        const { width, height } = ref.current.getBoundingClientRect();
        setTreeDimens({ width, height });
    }, [])

    useEffect(() => {
        setCount(tree?.visibleNodes.length ?? 0);
    }, [tree, searchTerm])

    return (
        <Flex w="100%" h="100%" direction="column" overflow="hidden">
            <Stack h="100%">
                <Box pl="2" w="100%" h="100%" bgColor="blue.300">
                    <Text fontSize='xl'>Images</Text>
                </Box>
                <Button onClick={selectImageFile}>GETFILE</Button>
                <Button onClick={selectImageDirectory}>GETDIR</Button>
                <Text>DIRS</Text>
                <Flex width="100%" direction="column" ref={ref}>
                    <Tree
                        data={directories}
                        width={treeDimens.width}
                        idAccessor="path"
                        childrenAccessor={(node) => node.children}
                        disableMultiSelection={false}
                        searchTerm={searchTerm}
                        ref={(t) => setTree(t)}
                        openByDefault={false}
                        selection={active?.path}
                        onSelect={(selected) => setSelectedCount(selected.length)}
                        onActivate={(node) => setActive(node.data)}
                        onFocus={(node) => setFocused(node.data)}
                        onToggle={() => {
                            setTimeout(() => {
                                setCount(tree?.visibleNodes.length ?? 0);
                            });
                        }}
                    >
                        {Node}
                    </Tree>
                </Flex>
            </Stack>
        </Flex>
    );
}
function Node({ node, style, dragHandle }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Flex
            alignItems="center"
            style={style}
            ref={dragHandle}
            onClick={() => {
                node.isInternal && node.toggle();
                setIsOpen(node.isOpen);
            }}
        >
            {node.isLeaf ? (
                <Icon as={IoImageOutline} mr={2} />
            ) : (
                <Icon
                    as={isOpen ? IoIosArrowDown : IoIosArrowForward}
                    mr={2}
                />

            )}
            {node.data.name}
        </Flex>
    );
}
/*
function Node({ node, style, tree, dragHandle }: NodeRendererProps<FileEntry>) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!node.isLeaf) {
            setIsOpen(!isOpen);
        }
    };

    const paddingLeft = `${node.depth * 20}px}`;

    return (
        <Flex style={style} alignItems="center">
            <Flex alignItems="center" ml={paddingLeft}>
                {node.isLeaf ? (
                    <Icon as={IoImageOutline} mr={2} />
                ) : (
                    <Icon
                        as={isOpen ? IoIosArrowDown : IoIosArrowForward}
                        mr={2}
                        onClick={handleClick}
                        cursor="pointer"
                    />

                )}
                <Text fontSize="sm">{node.data.name}</Text>
            </Flex>
            {!node.isLeaf && isOpen && (
                <Box ml={2}>
                    {node.children.map((childNode) => (
                        <Node
                            key={childNode.id}
                            node={childNode}
                            style={style}
                            tree={tree}
                            dragHandle={dragHandle}
                        />
                    ))}
                </Box>
            )}

        </Flex >
    );
}
*/
export default Filetree;