'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Container, Typography } from '@mui/material';

import Header from '../components/Header';
import ConversationHistory from '../components/ConversationHistory';
import QuestionForm from '../components/QuestionForm';
import AdvertisementCard from '../components/AdvertisementCard';

interface HistoryItem {
  role: string;
  content: string;
}

interface Company {
  name: string;
}

interface Campaign {
  companies: Company;
  description: string;
  id: number;
  product_url: string | null;
  treatment_name: string;
}

interface Ad {
  id: number;
  campaign_id: number;
  campaigns: Campaign;
  bid: number;
}

export default function PhysicianHome() {
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [adLoading, setAdLoading] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);

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
    setStreamingContent('');

    const questionToAsk = question;
    const historyToUse = history;
    const newHistory = [...history, { role: 'user', content: questionToAsk }];

    setHistory(newHistory);
    setCurrentQuestion(questionToAsk);
    setQuestionHistory(historyToUse);
    setQuestion('');

    try {
      const adPromise = axios.post('/api/advertisement', { question: questionToAsk });

      const [adResponse] = await Promise.all([adPromise]);
      console.log("adResponse", adResponse.data)
      setAd(adResponse.data);
      setAdLoading(false);

      // Wait for ad to complete (5 second wait) before starting LLM request
      // The LLM streaming will only start after the ad is done
    } catch (error) {
      console.error('Error fetching the answer:', error);
      setLoading(false);
    }
  };

  const startLLMStreaming = async (currentQuestion: string, history: HistoryItem[]) => {
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          history,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stream');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedAnswer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Add the complete streamed response to history
                setHistory(prev => [...prev, { role: 'assistant', content: streamedAnswer }]);
                setStreamingContent('');
                setLoading(false);
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  streamedAnswer += parsed.content;
                  setStreamingContent(streamedAnswer);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching the answer:', error);
      setLoading(false);
    }
  };

const handleAdComplete = () => {
    setAd(null);
    if (currentQuestion) {
      startLLMStreaming(currentQuestion, questionHistory);
    }
  };

  const clearConversation = () => {
    setHistory([]);
    setQuestion('');
    setAd(null);
    setStreamingContent('');
    setCurrentQuestion('');
    setQuestionHistory([]);
  }

  const handleNewConversation = () => {
    clearConversation();
    scrollToBottom();
  };

  useEffect(() => {
    scrollToBottom();
  }, [loading, history, ad, streamingContent]);

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
          handleNewConversation={handleNewConversation}
          showNewChatButton={true}
        />
        <Container maxWidth="md" style={{ flex: 1, overflowY: 'auto' }} ref={chatHistoryRef}>
          <ConversationHistory history={history} streamingContent={streamingContent} />
          {ad && <AdvertisementCard ad={ad} onAdComplete={handleAdComplete} />}
          {ad && (
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography color="white" >
                Thinking about this response...
              </Typography>
            </Box>
          )}
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