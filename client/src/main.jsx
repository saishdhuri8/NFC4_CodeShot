import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContextProvider from './contextProvider/UserContextProvider.jsx'
import { BrowserRouter } from "react-router";
import { FireBaseAuthProvider } from './FireBase/FireBaseAuth.jsx';




createRoot(document.getElementById('root')).render(

    <FireBaseAuthProvider>
        <BrowserRouter>

        
            <UserContextProvider>
                <App />
            </UserContextProvider>


        </BrowserRouter>
    </FireBaseAuthProvider>

)
