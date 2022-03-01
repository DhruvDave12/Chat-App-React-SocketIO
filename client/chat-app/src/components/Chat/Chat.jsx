import React, { useState, useEffect} from 'react';
import { useSearchParams} from 'react-router-dom';
import queryString from 'query-string';
import io from "socket.io-client";

import Infobar from '../Infobar/Infobar';
import Messages from '../Messages/Messages';
import Input from '../Input/Input';
import TextContainer from '../TextContainer/TextContainer';

import './Chat.css';
let socket;
const Chat = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUser] = useState([]);

    // online deployed application server
    
  const ENDPOINT = 'https://react-personal-application.herokuapp.com/';

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
      // added transports so that CORS Policy helps to transfer request from client to server
      socket = io(ENDPOINT, { transports : ['websocket'] });

      setName(searchParams.get('name'));
      setRoom(searchParams.get('room'));
      // puhsing the users
      setUser(...users, searchParams.get('name'));

      socket.emit('join', {name: searchParams.get('name'), room: searchParams.get('room'), callback: ({error}) =>{
  
      }});
      return () => {
        socket.emit('disconnect');

        socket.off();
      }

    }, [ENDPOINT, searchParams]);
    
    useEffect(() => {
      socket.on('message', (message) => {
        // adding the new message to our message array.
        setMessages([...messages, message]);
      }, [messages]);
    })

   // Function for sending messages
    const sendMessage = (event) => {
      event.preventDefault();

      if(message){
        // sending message to our backend
        socket.emit('sendMessage', message,() => setMessage(''));
      }
    }
 
    console.log(message, messages);

  return (
      <div className="outerContainer">
      <div className="container">
          <Infobar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      {/* <TextContainer users={users}/> */}
    </div>
  );
};

export default Chat;
