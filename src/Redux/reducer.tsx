import { PayloadAction} from "@reduxjs/toolkit";
import {sendLogin} from "../API/websocket-api";

const initialState : any ={
    messages : [],
    contacts : [],
}
const loadContacts=()=>{
    return [];
}
export const Reducer = (state = initialState, action: PayloadAction<any>)=>{

    switch (action.type){
        case "Login":{
            console.log(action.payload.user);
            sendLogin(action.payload)
            return{
                ...state,

            }
        }
        default:{
            return {
                ...state
            };
        }
    }
}
