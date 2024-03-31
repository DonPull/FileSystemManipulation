import React, { useEffect, useState } from "react";
import "../styles/Modal.css";

function Modal({openBtnRef, cancelBtnRefs, children}){
    const [modalIsOpen, setModalIsOpen] = useState(false);
    let modalRef = React.createRef();
    let modalBackgroundRef = React.createRef();

    useEffect(() => {
        cancelBtnRefs.forEach(e => {
            if(e !== undefined){
                e.current.onclick = () => {
                    closeModal();
                }
            }
        });

        openBtnRef.current.onclick = (event) => {
            event.stopPropagation();
            setModalIsOpen(true);
        }
    }, []);
    
    let closeModal = (event) => {
        setModalIsOpen(false);
    }

    return (
        <>
            <div ref={modalBackgroundRef} style={modalIsOpen ? {display: "flex"} : {display: "none"}} className="modal-background" onClick={(event) => closeModal(event)}/>
            <div ref={modalRef} style={modalIsOpen ? {display: "flex"} : {display: "none"}} className="modal">
                {children}
            </div>
        </>
    )
}

export default Modal