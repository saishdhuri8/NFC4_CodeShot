import React from 'react'
import { Link } from 'react-router'

export default function Navbar() {
    return (
        <>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                CodeCollab
                </div>
                <div className="hidden md:flex space-x-8">
                <Link to="/" className="hover:text-blue-400 transition">Features</Link>
                <Link to="/code" className="hover:text-blue-400 transition">Code</Link>
                <Link to="/editor" className="hover:text-blue-400 transition">Editor</Link>
                </div>
                <Link to="/auth" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Sign In
                </Link>
            </nav>
        </>
    )
}
