

export const login=(data:any) =>{
    return{
        type:"Login",
        payload:data,
    }
}
export const getUser=(data:any) =>{
    return{
        type:"getUser",
        payload:data,
    }
}