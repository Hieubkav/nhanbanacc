"use client"

import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export default function HelloPage(){
    const text = useQuery(api.hello.hellovy)

    return (
        <div>
            <h1>Hello vy tèo</h1>
            <p>{text}</p>
        </div>
    )

}