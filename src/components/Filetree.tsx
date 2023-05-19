import { useState, useEffect, useRef, useContext, createContext } from 'react';
import {
    Box,
    Button,
    Flex,
    Stack,
    Text,
    Icon,
    IconButton,
    ButtonGroup,
    Spacer,
    Divider,
    Tooltip
} from '@chakra-ui/react';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { readDir, readTextFile, FileEntry } from '@tauri-apps/api/fs';
import { Tree, TreeApi } from 'react-arborist';
import { IoImageOutline } from 'react-icons/io5';
import { AiFillFileAdd, AiFillFolderAdd, AiOutlineFileText } from 'react-icons/ai';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { RxText, RxTextNone, RxDotFilled } from 'react-icons/rx';
import styles from '../styles/filetree.module.css';
import clsx from 'clsx';
import { CanvasContext, textPair } from './Canvas';

type treeDimensions = { width: number; height: number };

export const FiletreeContext = createContext(null);

function Filetree({ onSelection, resetImageCache }) {
    const [tree, setTree] = useState<TreeApi<FileEntry> | null | undefined>(null);
    const [treeDimens, setTreeDimens] = useState<treeDimensions>({ width: 0, height: 0 });
    const [active, setActive] = useState<FileEntry | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCount, setSelectedCount] = useState(0);
    const [count, setCount] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);
    const [reRender, setReRender] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const {
        imageCache,
        setImageCache,
        imageTree,
        setImageTree,
        fileMode,
        setFileMode,
        focused,
        setFocused
    } = useContext(CanvasContext);

    const ref = useRef(null);

    // Helper function to replace an element in the imageTree with a new image instance
    function replaceElement(tree: FileEntry[], newFile: FileEntry) {
        for (let i = 0; i < tree.length; i++) {
            if (tree[i].name === newFile.name) {
                tree[i] = newFile;
                break;
            } else if (tree[i].children !== null && tree[i].children.length > 0) {
                replaceElement(tree[i].children, newFile);
            }
        }
    }

    // Given a file tree for text files, update the associated images in the image cache
    async function addText(textTree: FileEntry[]) {
        for (let i = 0; i < textTree.length; i++) {
            let textFileEntry = textTree[i];

            if (textFileEntry.children !== null && textFileEntry.children.length > 0) {
                addText(textFileEntry.children);
            } else {
                let fileName: string = await invoke("get_file_name", { path: textFileEntry.path })
                    .then((result: string) => result)
                    .catch((error) => {
                        console.error(error);
                        return null;
                    });

                if (fileName !== null && imageCache.has(fileName)) {
                    let fileContents = await readTextFile(textFileEntry.path);

                    let textPairs: textPair[] = JSON.parse(fileContents);

                    setImageCache(new Map(imageCache.set(fileName, {
                        imageData: imageCache.get(fileName).imageData,
                        imagePath: imageCache.get(fileName).imagePath,
                        text: {
                            textName: fileName,
                            textPath: textFileEntry.path,
                            textPairs: textPairs.slice(0, -1),
                        },
                        modified: imageCache.get(fileName).modified
                    })));
                }
            }
        }
    }

    // Given a file tree for image files, filter out the entries with bad paths 
    // (Can't extract stems in UTF-8) and initialize each one in the image cache
    async function addImagesToCache(localImageTree: FileEntry[]) {
        let newTree: FileEntry[] = [];

        for (let i = 0; i < localImageTree.length; i++) {
            let imageFileEntry = localImageTree[i];

            if (imageFileEntry.children !== null && imageFileEntry.children.length > 0) {
                newTree.push({
                    children: await addImagesToCache(imageFileEntry.children),
                    name: imageFileEntry.name,
                    path: imageFileEntry.path,
                });
            } else {
                let fileName: string = await invoke("get_file_name", { path: imageFileEntry.path })
                    .then((result: string) => result)
                    .catch((error) => {
                        console.error(error);
                        return null;
                    });

                if (fileName !== null) {
                    newTree.push({
                        children: null,
                        name: fileName,
                        path: imageFileEntry.path,
                    });

                    setImageCache(new Map(imageCache.set(fileName, {
                        imageData: null,
                        imagePath: imageFileEntry.path,
                        text: {
                            textName: null,
                            textPath: null,
                            textPairs: null,
                        },
                        modified: false
                    })));

                } else {
                    continue;
                }
            }
        }

        return newTree
    }

    // Walks the image directory and wipes the old imge tree/cache
    async function selectImageDirectory() {
        const dir = await open({
            directory: true,
            recursive: true
        }) as string;

        if (dir !== null) {
            let entries = await readDir(dir, { recursive: true });
            let file_tree = JSON.stringify(entries);

            invoke("filter_tree", { fileTree: file_tree, images: true })
                .then(async (result) => {
                    setLoadingFiles(true);
                    let localImageTree: FileEntry[] = await addImagesToCache(JSON.parse<FileEntry[]>(result));
                    setImageTree(localImageTree);
                    setLoadingFiles(false);
                })
                .catch((error) => console.error(error));

            console.log("Walked image directory");
            console.log(imageTree);
        }
    }

    // Selects one or multiple image files and either replaces an existing image file
    // and resets the image cache, or adds a new image file to the image tree.
    async function selectImageFile() {
        const imagePaths: string[] = await open({
            multiple: true,
            filters: [{
                name: 'Image',
                extensions: ['png', 'jpg', 'jpeg', 'webp']
            }]
        }) as string[];

        setLoadingFiles(true);
        if (imagePaths !== null) {
            for (let imagePath of imagePaths) {
                // Get the file name or error and continue on
                // TODO: Add error dialog
                let fileName: string = await invoke("get_file_name", { path: imagePath })
                    .then((result: string) => result)
                    .catch((error) => {
                        console.error(error);
                        return null;
                    });

                if (fileName !== null) {
                    let imageFileEntry = {
                        children: [],
                        name: fileName,
                        path: imagePath,
                    }

                    // Replace the image file in the tree/wipe the cache if it already exists
                    // Else add it to the image tree
                    if (imageCache.has(fileName)) {
                        replaceElement(imageTree, imageFileEntry);

                        setImageCache(new Map(imageCache.delete(fileName)));
                        setImageTree(imageTree);
                    } else {
                        setImageCache(new Map(imageCache.set(fileName, {
                            imageData: null,
                            imagePath: imagePath,
                            text: {
                                textName: null,
                                textPath: null,
                                textPairs: null,
                            },
                            modified: false
                        })));

                        setImageTree(imageTree.push(imageFileEntry));
                    }
                }
            }
        }
        setLoadingFiles(false);
    }

    // Walks the text directory and replaces any existing text files associated with
    // image files with the new ones or adds them
    async function selectTextDirectory() {
        const dir = await open({
            directory: true,
            recursive: true
        }) as string;

        if (dir !== null) {
            let entries = await readDir(dir, { recursive: true });
            let file_tree = JSON.stringify(entries);

            invoke("filter_tree", { fileTree: file_tree, images: false })
                .then(async (result: string) => {
                    const newTextTree: FileEntry[] = JSON.parse<FileEntry[]>(result);
                    setLoadingFiles(true);
                    await addText(newTextTree);
                    setLoadingFiles(false);
                })
                .catch((error) => console.error(error));

            console.log(imageCache);
        }
    }

    // Selects one or multiple text files and replaces any existing text files associated
    // with image files with the new ones or adds them
    async function selectTextFile() {
        const textPaths: string[] = await open({
            multiple: true,
            filters: [{
                name: 'Text',
                extensions: ['json']
            }]
        }) as string[];

        setLoadingFiles(true);
        if (textPaths !== null) {
            for (let textPath of textPaths) {
                let fileName: string = await invoke("get_file_name", { path: textPath })
                    .then((result: string) => result)
                    .catch((error) => {
                        console.error(error);
                        return null;
                    });

                if (fileName !== null) {
                    let textFileEntry = {
                        children: [],
                        name: fileName,
                        path: textPath,
                    }

                    // If there is a associated image, replace or add the text file
                    if (imageCache.has(fileName)) {
                        let fileContents = await readTextFile(textPath);
                        let textPairs: textPair[] = [];

                        JSON.parse(fileContents, (originalText, translatedText) => {
                            textPairs.push([originalText, translatedText]);
                        });

                        setImageCache(new Map(imageCache.set(fileName, {
                            imageData: imageCache.get(fileName).imageData,
                            imagePath: imageCache.get(fileName).imagePath,
                            text: {
                                textName: fileName,
                                textPath: textFileEntry.path,
                                textPairs: textPairs.slice(0, -1),
                            },
                            modified: imageCache.get(fileName).modified
                        })));
                    }
                }
            }
        }
        setLoadingFiles(false);
    }

    function handleTabsChange(index: number) {
        console.log(index);
        setTabIndex(index);
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

    useEffect(() => {
        console.log(focused);
        if (focused !== null) {
            console.log(imageCache.get(focused.name));
        }
    }, [focused])

    return (
        <Flex w="100%" h="100%" direction="column" overflow="hidden">
            <Stack h="100%">
                <Flex>
                    <Tooltip hasArrow color="white" bg="#6a6a6a" label="Toggle File Mode" placement="bottom">
                        <Text sx={{
                            cursor: "pointer",
                            userSelect: "none"
                        }} margin="auto" fontSize="2xl" px="2" onClick={() => {
                            if (fileMode == "Images") {
                                setFileMode("Text");
                            } else {
                                setFileMode("Images");
                            }
                        }}>{fileMode}</Text>
                    </Tooltip>
                    <Spacer />
                    <ButtonGroup>
                        <Tooltip
                            hasArrow
                            color="white"
                            bg="#6a6a6a"
                            label={fileMode == "Images" ? "Add Image File" : "Add Text File"}
                            closeDelay={1000}
                            placement="bottom"
                        >
                            <IconButton
                                color="#ff6700"
                                backgroundColor="#323232"
                                aria-label="Add File"
                                py="-1"
                                isLoading={loadingFiles}
                                icon={<AiFillFileAdd />}
                                onClick={() => {
                                    if (fileMode == "Images") {
                                        selectImageFile()
                                    } else {
                                        selectTextFile()
                                    }
                                }}
                            />
                        </Tooltip>
                        <Tooltip
                            hasArrow
                            color="white"
                            bg="#6a6a6a"
                            label={fileMode == "Images" ? "Add Image Directory" : "Add Text Directory"}
                            closeDelay={1000}
                            placement="bottom"
                        >
                            <IconButton
                                color="#ff6700"
                                backgroundColor="#323232"
                                aria-label="Add Folder"
                                py="-2px"
                                isLoading={loadingFiles}
                                icon={<AiFillFolderAdd />}
                                onClick={() => {
                                    if (fileMode == "Images") {
                                        selectImageDirectory()
                                    } else {
                                        selectTextDirectory()
                                    }
                                }}
                            />
                        </Tooltip>
                    </ButtonGroup>
                </Flex>
                <Divider />
                <Flex sx={{
                    "::-webkit-scrollbar": {
                        display: "none"
                    }
                }} px="2" overflowY="scroll" width="100%" height="100%" direction="column" ref={ref}>
                    <Tree
                        className={styles.tree}
                        data={imageTree}
                        width={treeDimens.width}
                        height={treeDimens.height}
                        idAccessor="path"
                        childrenAccessor={(node: FileEntry) => node.children}
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
            </Stack >
        </Flex >
    );
}
function Node({ node, style, dragHandle }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { imageCache, setImageCache, fileMode, setFileMode } = useContext(CanvasContext);

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
            <Spacer />
            {node.isLeaf
                && imageCache.has(node.data.name)
                && (imageCache.get(node.data.name).modified === true)
                && (
                    <Icon as={RxDotFilled} mr={1} />
                )
            }
            {node.isLeaf
                && imageCache.has(node.data.name)
                && (imageCache.get(node.data.name).text.textName !== null)
                && (
                    <Icon as={RxText} mr={2} />
                )}
        </Flex>
    );
}

export default Filetree;