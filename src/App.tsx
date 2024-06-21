// App.tsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes } from './routes/routes';
import {ReLoginProvider} from "./pages/Login/ReLoginContext";

function App() {
    return (
        <Router>
            <ReLoginProvider>
                <div className="App">
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            return <Route key={index} path={route.path} element={<Page />} />
                        })}
                    </Routes>
                </div>
            </ReLoginProvider>
        </Router>
    );
}

export default App;
