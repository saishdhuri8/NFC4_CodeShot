
import React from 'react'
import UserContext from '../context/UserContext'
import { useState } from 'react'


const UserContextProvider = ({ children }) => {
    const [userId, setuserId] = useState(null)
    


    return (
        <UserContext.Provider value={{ userId, setuserId }}>
            {children}
        </UserContext.Provider>
    )
}


export default UserContextProvider
