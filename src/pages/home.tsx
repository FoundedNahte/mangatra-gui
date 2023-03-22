import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Box } from "@chakra-ui/react";
import Canvas from "../components/Canvas";

import styles from "../styles/Home.module.css";
function Home() {
    return (
        <Box w="100%" h="100%" bgColor='#303030'>
            <Canvas />
        </Box>
    );
}

export default Home;