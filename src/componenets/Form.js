import React, { useState } from "react";
import { nanoid } from "nanoid";
import { getDatabase, child, ref, set, get } from "firebase/database";
import { isWebUri } from "valid-url";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";





export const Form = () => {
    let startState = {
       longURL: '',
       preferedAlias: '',
       generatedURL: '',
       loading: false,
       errors: [],
       errorMessages: {},
       toolTipMessage: 'Copy to Clip Board' 
    };

    const [state, setCurrentState] = useState(startState);

    const onSubmit = async (event) => {
        event.preventDefault();
        setCurrentState({...state, loading: true,});
        setCurrentState({...state, generatedURL: '',});




        const isFormValid = await validateInput();
        if(!isFormValid) {
            return;
        }

        let generatedKey = nanoid(5);
        let generatedURL = "shrinklink.com/" + generatedKey;



        if (state.preferedAlias !== '') {
            generatedKey = state.preferedAlias;
            generatedURL = "shrinklink.com/" + state.preferedAlias;
        }

        const db = getDatabase();
        set(ref(db, '/' + generatedKey), {
            generatedKey: generatedKey,
            longURL: state.longURL,
            preferedAlias: state.preferedAlias,
            generatedURL: generatedURL    
        }).then((result) => {
            setCurrentState((previousState) => ({...previousState, generatedURL: generatedURL, loading: false,}));

        }).catch((e) => {})
    }

    const hasError = (key) => {


        return state.errors.indexOf(key) !== -1;
    }

    const HandleChange = (e) => {
        const { id, value } = e.target
        setCurrentState({...state,[id] : value,});
        
    }

    const validateInput = async () => {

        let tempErrors = [];
        let errorMessages = state.errorMessages;

        if(state.longURL.length === 0) {
            tempErrors.push("longURL");
            errorMessages['longURL'] = 'Please enter a URL.';
        } else if (!isWebUri(state.longURL)) {
            tempErrors.push("longURL");
            errorMessages["longURL"] = 'Please eneter a URL in the form of https://www....';
        }

        if(state.preferedAlias !== '') {
            if(state.preferedAlias.length > 7) {
                tempErrors.push("suggestedAlias");
                errorMessages["suggestedAlias"] = 'Please enter an Alias less than 7 Characters.'
            } else if (state.preferedAlias.indexOf(' ') >= 0 ) {
                tempErrors.push("suggestedAlias");
                errorMessages["suggestedAlias"] = "Spaces are not permitted in URLs.";
            }

            let keyExists = await checkKeyExists();
            if(keyExists.exists()) {
                tempErrors.push("suggestedAlias");
                errorMessages["suggestedAlias"] = 'The Alias you entered already exists. Please enter another one.';
            }

            
        }

        setCurrentState({...state, errors:tempErrors,});
        setCurrentState({...state, errorMessages: errorMessages,});
        setCurrentState({...state, loading: false,});


        
        if (tempErrors.length > 0) {
            return false;
        }
        return true;

    }

    const checkKeyExists = async () => {
        const dbRef = ref(getDatabase());
        return get(child(dbRef, `/${state.preferedAlias}`)).catch((error) => {return false});
    }

    const copyToClipBoard = () => {
        navigator.clipboard.writeText(state.generatedURL);
        setCurrentState({...state, toolTipMessage: "Copied!", });
    }
    
    return (
        <div className="container">
            <form autoComplete="off">
                <h3>Shrink Link!</h3>
                <div className="`form-group">
                    <label>Enter Your Long URL</label>
                    <input
                        id = "longURL"
                        onChange={HandleChange}
                        value={state.longURL}
                        type="URL"
                        required
                        className={hasError("longURL") ? 'form-control is-invalid' : 'form-control'}
                        placeholder="https://www...."
                    />

                </div>
                <div className={hasError("longURL") ? "text-danger" : "visually-hidden"}>
                    {state.errorMessages.longURL}
                    
                </div>

                <div className="form-group">
                        <label htmlFor="basic-url">Shrinked URL</label>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">shrinklink.com/</span>
                            </div>
                            <input
                                id="preferedAlias"
                                onChange={HandleChange}
                                value={state.preferedAlias}
                                className={
                                    hasError("preferedAlias")
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text" placeholder="eg. 3fwias (Optional)"
                            />
                        </div>
                        <div
                            className={
                                hasError("suggestedAlias") ? "text-danger" : "visually-hidden"
                            }
                        >
                            {state.errorMessages.suggestedAlias}
                        </div>
                    </div>

                <button className="btn btn-primary" type="button" onClick={onSubmit}>
                    {
                        state.loading ? 
                        <div>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"> </span>
                        </div> :
                        <div>
                            <span className="visually-hidden spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Shrink It</span>
                        </div>
                    }
                </button>

                    {
                        state.generatedURL === '' ?
                            <div></div>
                            :
                            <div className="generatedurl">
                                <span>Your generated URL is: </span>
                                <div className="input-group mb-3">
                                    <input disabled type="text" value={state.generatedURL} className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                    <div className="input-group-append">
                                        <OverlayTrigger
                                            key={'top'}
                                            placement={'top'}
                                            overlay={
                                                <Tooltip id={`tooltip-${'top'}`}>
                                                    {state.toolTipMessage}
                                                </Tooltip>
                                            }
                                        >
                                            <button onClick={() => copyToClipBoard()} data-toggle="tooltip" data-placement="top" title="Tooltip on top" className="btn btn-outline-secondary" type="button">Copy</button>

                                        </OverlayTrigger>

                                    </div>
                                </div>
                            </div>
                    }

            </form>

        </div>
    )
}

