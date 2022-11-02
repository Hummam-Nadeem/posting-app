// import "./index.css"
import moment from "moment";
import { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    query,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    orderBy
} from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAJ6yA_W3Ang7Ffs58OMtmVZB84fNMMT4A",
    authDomain: "posting-30b82.firebaseapp.com",
    projectId: "posting-30b82",
    storageBucket: "posting-30b82.appspot.com",
    messagingSenderId: "505647306872",
    appId: "1:505647306872:web:67dccdc9181e3e51c8b58d",
    measurementId: "G-W1Z3N1WN4N"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const Hello = () => {

    const [posts, setPosts] = useState([]);
    const [postText, setPostText] = useState("");
    // const [isLoading, setLoading] = useState(false);
    const [isPosting, setPosting] = useState(false);

    const [editingData, setEditingData] = useState({
        editingId: null,
        editingText: ""
    });


    useEffect(() => {
        const getData = async () => {
            const querySnapshot = await getDocs(collection(db, "posts"));

            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => `, doc.data());

                setPosts((prev) => {

                    let newArray = [...prev, doc.data()]

                    return newArray
                })

            });
        };
        getData();

        let unsubscribe = null;

        let getRealtimeData = async () => {

            const q = query(collection(db, "posts"), orderBy("createdOn", "desc"));

            unsubscribe = onSnapshot(q, (querySnapshot) => {

                const posts = [];

                querySnapshot.forEach((doc) => {

                    // posts.push(doc.data());

                    posts.push({ id: doc.id, ...doc.data() });

                });

                setPosts(posts);
                console.log("posts : ", posts);
            });
        }

        getRealtimeData();

        return () => {
            console.log("CleanUp");
            unsubscribe();
        }

    }, [])


    const savePost = async (e) => {
        e.preventDefault();

        console.log("postText : ", postText);

        try {
            const docRef = await addDoc(collection(db, "posts"), {
                text: postText,
                createdOn: new Date()
            });
            console.log("Document written with ID: ", docRef.id);
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
        setPosting(!isPosting)
    }

    const deletePost = async (postId) => {
        console.log("postId :", postId);

        await deleteDoc(doc(db, "posts", postId));
    }

    const updatePost = async (e) => {

        e.preventDefault();

        await updateDoc(doc
            (db, "posts", editingData.editingId),
            {
                text: editingData.editingText
            });

        setEditingData({
            editingId: null,
            editingText: ""
        });
    }

    return (
        <div className="main" >

            <div className="postingDiv"
                style={isPosting ?
                    { backgroundColor: "gainsboro" } :
                    { backgroundColor: "whitesmoke" }}>

                {(isPosting) ?
                    <form action="" className="postingForm" onSubmit={savePost}>
                        <textarea
                            className="postInput"
                            autoFocus
                            type="text"
                            required
                            max={100}
                            onChange={(e) => {
                                setPostText(e.target.value)
                            }}

                        />

                        <div className="btnDiv">

                            <button className="shareBtn" onClick={() => {
                                setPosting(!isPosting)
                            }}>Cancel</button>
                            <button type="submit" className="shareBtn">Share</button>

                        </div>

                    </form>
                    :
                    null
                }

                {(isPosting) ? null : <button className="postingBtn"
                    onClick={() => {
                        setPosting(!isPosting)
                    }}>
                    Post
                </button>
                }
            </div>


            <div className="postDiv">

                {posts.map((eachPost, i) => (

                    <div className="postCard" key={i} >

                        <div className="postHead">

                            <p className="time">{moment((eachPost?.createdOn?.seconds) ?
                                eachPost?.createdOn?.seconds * 1000 : undefined
                            ).format('Do MMMM, h:mm a')}</p>

                            {(eachPost.id === editingData.editingId) ?
                                <form className="postUpdateForm" onSubmit={updatePost}>

                                    <textarea className="postUpdateInput" type="text"
                                        autoFocus
                                        value={editingData.editingText}
                                        placeholder="Enter updates"
                                        onChange={(e) => {
                                            setEditingData({
                                                ...editingData,
                                                editingText: e.target.value
                                            })
                                        }} />

                                    <button type="submit" className="postUpdateBtn">Update</button>

                                </form>
                                :
                                <h3 className="postTitle">  {eachPost.text} </h3>

                            }
                        </div>

                        <div className="postFooter">
                            <button className="dltBtn" onClick={() => {
                                deletePost(eachPost?.id)
                            }}>
                                Delete
                            </button>

                            <button className="editBtn" onClick={() => {
                                setEditingData((editingData.editingId === eachPost?.id) ?

                                    {
                                        editingId: null,
                                        editingText: ""
                                    }
                                    :
                                    {
                                        editingId: eachPost?.id,
                                        editingText: eachPost?.text
                                    }
                                )
                            }}
                            > {(editingData.editingId === eachPost?.id) ? "Cancel" : "Edit"
                                } </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>

    )
}

export default Hello;
