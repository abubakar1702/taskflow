import { configureStore, createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'app',
    initialState: {
        test: true,
    },
    reducers: {
        toggleTest: (state) => {
            state.test = !state.test;
        },
    },
});

export const { toggleTest } = appSlice.actions;

export const store = configureStore({
    reducer: {
        app: appSlice.reducer,
    },
});
