import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Link from 'next/link';
import Image from "next/image";
import reactLogo from "../assets/react.svg";
import tauriLogo from "../assets/tauri.svg";
import nextLogo from "../assets/next.svg";

function Test() {
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    async function get_image() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        setImage(await invoke("get_image", { name }));
    }
    const mode = "extract";
    return (
        <div className="container">
            <p> TEST WELCOME </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    get_image();
                }}
            >
                <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter a path..."
                />
                <button>Image</button>
                <img src={`data:image/jpeg;base64,${image}`} alt="test" />
            </form>
            <p>{name}</p>
        </div>
    );
}

export default Test;