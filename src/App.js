import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyDhXbtH-arJ8OpCbIG3s7Ajw1fHdoAyBD0",
  authDomain: "lets-talk-dude.firebaseapp.com",
  databaseURL: "https://lets-talk-dude.firebaseio.com",
  projectId: "lets-talk-dude",
  storageBucket: "lets-talk-dude.appspot.com",
  messagingSenderId: "846449396533",
  appId: "1:846449396533:web:1f42f3dfd529ec8ac45a7c"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>
          <span className="yellow">hea</span>
          <span className="grey">d</span>
          <span className="blue">way</span>
        </h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  
  return (
    <div>
        <button onClick={signInWithGoogle}>Войти с помощью Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <div>
        <button onClick={() => auth.signOut}>Покинуть чат</button>
    </div>
  )
}

function ChatRoom() {
  const dum = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(10);
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [msgCollection, setMsgCollection] = useState(messages);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })
    setFormValue('');
    dum.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMassage key={msg.id} message={msg} />)}
      <div ref={dum}></div>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit">✔️</button>
    </form>
    </>
  )
}

function ChatMassage(props) {
  const {text, uid, photoURL, id} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const deletedMessageClass = text ? '' : 'deleted';
  const deleteMessage = async() => {
    // e.preventDefault();
    firestore.collection('messages').doc(props.message.id).update({
      text: '',
    })
    console.log('~~~', id);
  }
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p className={deletedMessageClass}>{text ? text : 'Сообщение удалено'}</p>
      { text && <p className={`button-delete ${deletedMessageClass}`} onClick={deleteMessage}>❌</p>}
    </div>
  )
}

export default App;
