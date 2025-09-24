import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const ChatPanel = React.memo(({ messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile) return;

    const msgData = {
      text: newMessage.trim(),
    };

    // if (selectedFile) {
    //   msgData.fileName = selectedFile.name;
    //   msgData.fileUrl = URL.createObjectURL(selectedFile);
    // }

    if (selectedFile) {
      const maxFileSize = 500 * 1024;
      if (selectedFile.size > maxFileSize) {
        toast.error("Files with size > 500KB are not allowed", {
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const fileBuffer = reader.result;

        msgData.fileName = selectedFile.name;
        msgData.fileType = selectedFile.type;
        msgData.fileData = fileBuffer;

        onSendMessage(msgData);
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      onSendMessage(msgData);
    }

    setNewMessage('');
    setSelectedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col w-full h-full md:max-w-sm bg-white border-l border-gray-200 shadow-md">
      <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 text-base">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-gray-100 p-3 rounded-lg text-gray-700">
            <div className="font-semibold text-xs text-gray-500 mb-1">
              {msg.user}
            </div>
            {msg.text && <div className="mb-1">{msg.text}</div>}
            {msg.fileUrl && (
              <div className="mt-2">
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  📎 {msg.fileName}
                </a>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-300 flex items-center gap-2">
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="hidden"
          id="fileUpload"
        />
        <label htmlFor="fileUpload" className="cursor-pointer text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          📎
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default ChatPanel;
