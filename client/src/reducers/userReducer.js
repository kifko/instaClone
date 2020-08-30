export const initialState = null

export const reducer = (state, action) => {
    if (action.type == "USER") {
        return action.payload
    }
    if (action.type == "CLEAR") {
        return null
    }
    if (action.type == "UPDATE") { //Recogemos el type UPDATE de followUser en UserProfile
        return { //Devolvemos un objeto
            ...state, //...spread the previous state..??
            followers: action.payload.followers, //append
            following: action.payload.following //append
        }
    }
    if (action.type == "UPDATEPIC") {
        return {
            ...state,
            pic: action.payload
        }
    }
    return state
}