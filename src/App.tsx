import React, {useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom";
import {publicRoutes} from './routes/routes';
import {onAuthStateChanged} from "firebase/auth"
import {auth} from "./libs/firebase";
import {useUserStore} from "./libs/userStore";
import {current} from "@reduxjs/toolkit";
import Login from "./pages/Login/login";
import ChatWindow from "./pages/ChatWindow/chat-window";

function App() {

    // const {currentUser, fetchUserInfo} = useUserStore();
    //
    // useEffect(() => {
    //     const unSub = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             fetchUserInfo(user.uid)
    //         }
    //     })
    //
    //     return () => {
    //         unSub();
    //     }
    // }, [fetchUserInfo]);

    return (
        <Router>
            <div className="App">
                {/*{*/}
                {/*    (currentUser === null) ? (*/}
                {/*        <>*/}
                {/*            <Login/>*/}
                {/*        </>*/}
                {/*    ) : (*/}
                {/*        <>*/}
                {/*            <ChatWindow/>*/}
                {/*        </>*/}
                {/*    )*/}
                {/*}*/}
                <Routes>
                    {
                        publicRoutes.map((route, index) => {
                            const Page = route.component;
                            return <Route key={index} path={route.path} element={<Page/>}/>
                        })
                    }
                </Routes>
            </div>
        </Router>
    )
        ;
}

export default App;
