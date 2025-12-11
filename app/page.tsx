'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from '@mui/material';
import Header from './components/Header';
import ConversationHistory from './components/ConversationHistory';
import QuestionForm from './components/QuestionForm';
import LoadingIndicator from './components/LoadingIndicator';

interface HistoryItem {
  role: string;
  content: string;
}

export default function Home() {
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    scrollToBottom();

    try {
      const response = await axios.post('/api/ask', { question, history });

      setHistory([...history, { role: 'user', content: question }, { role: 'assistant', content: response.data.answer }]);
      setAnswer(response.data.answer);
      setQuestion('');
    } catch (error) {
      console.error('Error fetching the answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer('');
    setQuestion('');
    scrollToBottom();
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, history]);

  return (
    <>
      <Header handleNewConversation={handleNewConversation} />

      <Container 
        maxWidth="md" 
        style={{ 
          marginTop: '120px', 
          fontFamily: 'Roboto, sans-serif', 
          marginBottom: '250px' 
      }}>
        {history.length > 0 && (
          <ConversationHistory history={history} />
        )}
        <QuestionForm
          question={question}
          setQuestion={setQuestion}
          handleSubmit={handleSubmit}
          loading={loading}
        />
        {loading && <LoadingIndicator />}
      </Container>
    </>
  );
}