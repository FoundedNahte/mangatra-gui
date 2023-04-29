import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    Stack,
    Text,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { readDir, FileEntry } from '@tauri-apps/api/fs';
import { Tree, TreeApi } from 'react-arborist';
import { IoImageOutline } from 'react-icons/io5';
import { AiFillFileAdd, AiFillFolderAdd } from 'react-icons/ai';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import styles from '../styles/filetree.module.css';
import clsx from 'clsx';

type treeDimensions = { width: number; height: number };

function Filetree({ onSelection, resetImageCache }) {
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

        resetImageCache();
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

        resetImageCache();
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
        if (active != null) {
            console.log(active.path);
        }
    }, [active])

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
                <IconButton
                    colorScheme="#ff6700"
                    aria-label="Add File"
                    icon={<AiFillFileAdd />}
                    onClick={() => selectImageFile()}
                />
                <IconButton
                    color="#ff6700"
                    backgroundColor="#323232"
                    aria-label="Add Folder"
                    outline={0}
                    icon={<AiFillFolderAdd />}
                    onClick={() => selectImageDirectory()}
                />
                <Text>DIRS</Text>
                <Flex sx={{
                    "scrollbar-width": "thin",
                    "::-webkit-scrollbar": {
                        display: "none"
                    }
                }} overflowY="scroll" width="100%" height="100%" direction="column" ref={ref}>
                    <Tree
                        className={styles.tree}
                        data={directories}
                        width={treeDimens.width}
                        height={treeDimens.height}
                        idAccessor="path"
                        childrenAccessor={(node) => node.children}
                        disableMultiSelection={true}
                        searchTerm={searchTerm}
                        ref={(t) => setTree(t)}
                        openByDefault={false}
                        selection={active?.path}
                        onSelect={(selected) => setSelectedCount(selected.length)}
                        onActivate={(node) => onSelection(node.data)}
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
            className={clsx(styles.node, node.state)}
            alignItems="center"
            style={style}
            ref={dragHandle}
            onClick={() => {
                if (node.isInternal && !node.isOpen) {
                    node.toggle();
                    setIsOpen(true);
                } else {
                    node.toggle();
                    setIsOpen(false);
                }
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

export default Filetree;