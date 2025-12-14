'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Container, SelectChangeEvent } from '@mui/material';

import Header from '../components/Header';
import ConversationHistory from '../components/ConversationHistory';
import QuestionForm from '../components/QuestionForm';
import AdvertisementCard from '../components/AdvertisementCard';

interface HistoryItem {
  role: string;
  content: string;
}

interface Ad {
  id: number;
  company: string;
  headline: string;
  body: string;
  cta: string;
  url: string;
}

interface PhysicianHomeParams {
  mode: string;
  handleModeChange: (event: SelectChangeEvent) => void;
} 

export default function PhysicianHome({ mode, handleModeChange }: PhysicianHomeParams) {
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [adLoading, setAdLoading] = useState<boolean>(false);

  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setAdLoading(true);
    setAd(null);

    const currentQuestion = question;
    const newHistory = [...history, { role: 'user', content: currentQuestion }];
    setHistory(newHistory);
    setQuestion('');

    try {
      const adPromise = axios.post('/api/advertisement', { question: currentQuestion });
      const llmPromise = axios.post('/api/ask', { question: currentQuestion, history });

      const [adResponse] = await Promise.all([adPromise]);
      setAd(adResponse.data.ad);
      setAdLoading(false);

      const llmResponse = await llmPromise;
      setHistory([...newHistory, { role: 'assistant', content: llmResponse.data.answer }]);
      setAnswer(llmResponse.data.answer);
      setAd(null);
    } catch (error) {
      console.error('Error fetching the answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setHistory([]);
    setAnswer('');
    setQuestion('');
    setAd(null);
  }

  const handleNewConversation = () => {
    clearConversation();
    scrollToBottom();
  };

  const handleModeChangeSelected = (event: SelectChangeEvent) => {
    clearConversation();
    handleModeChange(event);
  }

  useEffect(() => {
    scrollToBottom();
  }, [loading, history, ad]);

  if (ad || history.length > 0) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Header
          mode={mode}
          handleModeChange={handleModeChangeSelected}
          handleNewConversation={handleNewConversation}
          showNewChatButton={true}
        />
        <Container maxWidth="md" style={{ flex: 1, overflowY: 'auto' }} ref={chatHistoryRef}>
          <ConversationHistory history={history} />
          {ad && <AdvertisementCard ad={ad} />}
        </Container>
        <Container maxWidth="md" sx={{ marginBottom: '20px' }}>
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </Container>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <Header
        mode={mode}
        handleModeChange={handleModeChangeSelected}
        handleNewConversation={handleNewConversation}
        showNewChatButton={false}
      />
      <Box
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <h1>OpenEvidence</h1>
        </Box>
        <Container maxWidth="md" sx={{ width: '100%' }}>
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </Container>
      </Box>
    </Box>
  )
}