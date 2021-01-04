import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

import { Auth, Hub } from "aws-amplify";

const initialFormState = {
    username: "",
    password: "",
    email: "",
    authCode: "",
    formType: "signUp",
};

function App() {
    const [formState, updateFormState] = useState(initialFormState);
    const [user, updateUser] = useState(null);

    useEffect(() => {
        checkUser();
        setAuthListener();
    }, []);

    async function setAuthListener() {
        const listener = (data) => {
            switch (data.payload.event) {
                case "signIn":
                    console.log("user signed in");
                    break;
                case "signOut":
                    console.log("user signed out: ", data);
                    updateFormState(() => ({ ...formState, formType: "signUp" }));
                    break;
                default:
                    break;
            }
        };

        Hub.listen("auth", listener);
    }
    async function checkUser() {
        try {
            const user = await Auth.currentAuthenticatedUser();
            console.log("user: ", user);
            updateUser(user);
            updateFormState(() => ({ ...formState, formType: "signedIn" }));
        } catch (err) {}
    }

    function onChange(e) {
        e.persist();
        updateFormState(() => ({ ...formState, [e.target.name]: e.target.value }));
    }
    const { formType } = formState;

    async function signUp() {
        const { username, email, password } = formState;
        await Auth.signUp({ username, password, attributes: { email } });
        updateFormState(() => ({ ...formState, formType: "confirmSignUp" }));
    }

    async function confirmSignUp() {
        const { username, authCode } = formState;
        await Auth.confirmSignUp(username, authCode);
        updateFormState(() => ({ ...formState, formType: "signIn" }));
    }

    async function signIn() {
        const { username, password } = formState;
        await Auth.signIn(username, password);
        updateFormState(() => ({ ...formState, formType: "signedIn" }));
    }

    return (
        <div className="App">
            {formType === "signUp" && (
                <div>
                    <input name="username" onChange={onChange} placeholder="username" />
                    <input name="password" type="password" onChange={onChange} placeholder="password" />
                    <input name="email" onChange={onChange} placeholder="email" />
                    <button onClick={signUp}>Sign Up</button>
                    <button
                        onClick={() =>
                            updateFormState(() => ({
                                ...formState,
                                formType: "signIn",
                            }))
                        }
                    >
                        Sign In
                    </button>
                </div>
            )}
            {formType === "confirmSignUp" && (
                <div>
                    <input name="authCode" onChange={onChange} placeholder="Confirmation code" />
                    <button onClick={confirmSignUp}>Confirm sign up</button>
                </div>
            )}
            {formType === "signIn" && (
                <div>
                    <input name="username" onChange={onChange} placeholder="username" />
                    <input name="password" type="password" onChange={onChange} placeholder="password" />
                    <button onClick={signIn}>Sign In</button>
                </div>
            )}

            {formType === "signedIn" && (
                <div>
                    <h1>Hello world, welcome user!</h1>
                    <button onClick={() => Auth.signOut()}>Sign Out</button>
                </div>
            )}
        </div>
    );
}

export default App;
