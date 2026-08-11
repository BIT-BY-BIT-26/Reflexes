import {configureStore} from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'
import opdReducer from './slices/opdSlice';


export const store = configureStore({
    reducer:{
        theme:themeReducer,
        auth:authReducer,
        notification:notificationReducer,
        opd:opdReducer
    },
})