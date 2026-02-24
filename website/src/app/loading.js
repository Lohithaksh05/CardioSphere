"use client"

import { Spinner } from "@material-tailwind/react";

export default function Loading() {
    return (
    <div className="w-[100vw] h-[100vh] flex justify-center" style={{ alignItems: "center" }}>
        <Spinner className="h-16 w-16 text-white" />
        </div>
    );
}