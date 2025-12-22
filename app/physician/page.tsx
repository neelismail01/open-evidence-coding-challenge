'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Container, Button, Stack } from '@mui/material';

import ChatSidebar from '../components/ChatSidebar';
import ConversationHistory from '../components/ConversationHistory';
import QuestionForm from '../components/QuestionForm';

interface HistoryItem {
  role: string;
  content: string;
  ad?: Ad;
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

const RECOMMENDED_QUESTIONS = [
  "How do I treat a patient that is experiencing postoperative pain?",
  "How do I help a patient lose weight?",
  "What are the challenges a patient can experience after an organ transplant?",
  "What are pain management strategies I can offer to a patient during chemotherapy?",
];

export default function PhysicianHome() {
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);

  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const latestQuestionRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
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
      const fetchedAd = adResponse.data;
      setAd(fetchedAd);

      // Add the ad to the last user message in history
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0) {
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            ad: fetchedAd
          };
        }
        return newHistory;
      });

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
        })
      });

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
                // Add the complete streamed response as a new assistant message
                setHistory(prev => [...prev, {
                  role: 'assistant',
                  content: streamedAnswer
                }]);
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

  const handleAdImpression = async (ad: Ad) => {
    try {
      await axios.post('/api/advertisement/impression', {
        campaign_category_id: ad.id,
        bid: ad.bid
      });
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const handleAdClick = async (ad: Ad) => {
    try {
      await axios.post('/api/advertisement/clicks', {
        campaign_category_id: ad.id,
        bid: ad.bid
      });
    } catch (error) {
      console.error('Error recording ad click:', error);
    }
  };

  // Handle the 5-second timer to hide the ad and start streaming
  useEffect(() => {
    if (ad && ad.id) {
      const timer = setTimeout(() => {
        // Clear the ad state to show folded version
        setAd(null);
        if (currentQuestion) {
          startLLMStreaming(currentQuestion, questionHistory);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [ad, currentQuestion, questionHistory]);

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
  };

  const handleRecommendedQuestionClick = async (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
    setLoading(true);
    setAd(null);
    setStreamingContent('');

    const historyToUse = history;
    const newHistory = [...history, { role: 'user', content: selectedQuestion }];

    setHistory(newHistory);
    setCurrentQuestion(selectedQuestion);
    setQuestionHistory(historyToUse);
    setQuestion('');

    try {
      const adPromise = axios.post('/api/advertisement', { question: selectedQuestion });

      const [adResponse] = await Promise.all([adPromise]);
      const fetchedAd = adResponse.data;
      setAd(fetchedAd);

      // Add the ad to the last user message in history
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0) {
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            ad: fetchedAd
          };
        }
        return newHistory;
      });

    } catch (error) {
      console.error('Error fetching the answer:', error);
      setLoading(false);
    }
  };


  if (ad || history.length > 0) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100vh',
        }}
      >
        <ChatSidebar
          handleNewConversation={handleNewConversation}
        />
        <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Container maxWidth="md" style={{ flex: 1, flexDirection: 'column', overflowY: 'auto' }} ref={chatHistoryRef}>
            <ConversationHistory
              history={history}
              streamingContent={streamingContent}
              onAdClick={handleAdClick}
              onAdImpression={handleAdImpression}
              currentAd={ad}
              latestQuestionRef={latestQuestionRef}
            />
          </Container>
          <Container maxWidth="md" sx={{ marginBottom: '20px' }}>
            <QuestionForm
              question={question}
              setQuestion={setQuestion}
              chatStarted={true}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <ChatSidebar
        handleNewConversation={handleNewConversation}
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
            chatStarted={false}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          <Box sx={{ mt: 2 }}>
            <Stack spacing={1}>
              {RECOMMENDED_QUESTIONS.slice(0, 4).map((q, index) => (
                <Button
                  key={index}
                  variant="text"
                  onClick={() => handleRecommendedQuestionClick(q)}
                  sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '6px 24px',
                    borderRadius: 0,
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderBottom: '1px solid rgba(128, 128, 128, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderBottom: '1px solid rgba(128, 128, 128, 0.3)'
                    }
                  }}
                >
                  {q}
                </Button>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}