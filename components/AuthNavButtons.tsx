"use client";
import Link from "next/link";
import Button from "./ui/button";

export default function AuthNavButtons() {
    const  isAuthenticated = false
    return isAuthenticated ? (
        <Button className="bg-accent hover:bg-highlight text-white px-10 py-3 animate-in-out transition-all">
            Dashboard
        </Button>
    ) : (
        <>
            <div className="flex items-center gap-5 ">
                <Button
                    className="bg-blue-600 hover:bg-blue-400 text-white px-10 py-3 animate-in-out transition-all ">
                   <Link href="/request-a-demo">Book a Demo</Link>
                </Button>
                <Button
                    className="bg-white hover:bg-blue-600 border-2 border-blue-500  text-blue-500 hover:text-white px-10 py-3 animate-in-out transition-all">
                  <Link href="/login">Login</Link> 
                </Button>
            </div>

        </>
    );
}
