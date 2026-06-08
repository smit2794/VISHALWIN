import { useState, useEffect } from'react';

export interface ToastMessage {
 id: string;
 title: string;
 description?: string;
 type:'success'|'warning'|'danger'|'info';
}

let listeners: Array<(messages: ToastMessage[]) => void> = [];
let messages: ToastMessage[] = [];

export const showToast = (title: string, type: ToastMessage['type'] ='info', description?: string) => {
 const id = Math.random().toString(36).substring(2, 9);
 const newMessage: ToastMessage = { id, title, description, type };
 messages = [...messages, newMessage];
 listeners.forEach((listener) => listener(messages));

 setTimeout(() => {
 messages = messages.filter((m) => m.id !== id);
 listeners.forEach((listener) => listener(messages));
 }, 4000);
};

export const useToast = () => {
 const [toastMessages, setToastMessages] = useState<ToastMessage[]>(messages);

 useEffect(() => {
 const listener = (newMessages: ToastMessage[]) => {
 setToastMessages(newMessages);
 };
 listeners.push(listener);
 return () => {
 listeners = listeners.filter((l) => l !== listener);
 };
 }, []);

 const removeToast = (id: string) => {
 messages = messages.filter((m) => m.id !== id);
 listeners.forEach((listener) => listener(messages));
 };

 return { toastMessages, removeToast, showToast };
};
export default useToast;
