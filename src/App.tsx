import React from 'react';
import './App.css';
import Login from "./components/Login/login";
import {Outlet} from "react-router-dom";

function App() {
    return (
        <div className="App">
           <Outlet></Outlet>
        </div>

    );
}

export default App;
