'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControlLabel, Switch, Chip, Stack, IconButton } from '@mui/material'; // Added IconButton
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close'; // Added CloseIcon

interface Campaign {
    id: number;
    treatment_name: string;
    description: string;
    active: boolean;
    budget: number; // Added budget property
}

export default function EditCampaignPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [budget, setBudget] = useState<number>(0); // Added budget state
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState<string>('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await axios.get(`/api/advertisers/campaigns/${params.campaignId}`);
                const campaignData = response.data.campaign;
                setCampaign(campaignData);
                setName(campaignData.treatment_name);
                setDescription(campaignData.description);
                setIsActive(campaignData.active);
                setBudget(campaignData.budget || 0);
            } catch (error) {
                console.error('Error fetching campaign:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [params.campaignId]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            router.push('/advertiser');
        }, 300); // Animation duration
    };

    const handleSave = async () => {
        try {
            await axios.patch(`/api/advertisers/campaigns/${params.campaignId}`, {
                treatment_name: name,
                description: description,
                active: isActive,
                budget: budget,
            });
            router.push('/advertiser');
        } catch (error) {
            console.error('Error updating campaign:', error);
        }
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() !== '' && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput('');
        }
    };

    const handleDeleteKeyword = (keywordToDelete: string) => {
        setKeywords(keywords.filter((keyword) => keyword !== keywordToDelete));
    };

    if (loading) {
        return <Typography sx={{ color: 'white' }}>Loading...</Typography>;
    }

    if (!campaign) {
        return <Typography sx={{ color: 'white' }}>Campaign not found.</Typography>;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: '#121212',
                animation: isClosing
                    ? 'slideOutToRight 0.1s ease-out forwards'
                    : 'slideInFromRight 0.1s ease-out forwards',
                '@keyframes slideInFromRight': {
                    '0%': {
                        transform: 'translateX(100%)',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                    },
                },
                '@keyframes slideOutToRight': {
                    '0%': {
                        transform: 'translateX(0)',
                    },
                    '100%': {
                        transform: 'translateX(100%)',
                    },
                },
                p: 4,
                zIndex: 1200,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'white' }}>
                    Edit Campaign
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box component="form" noValidate autoComplete="off" sx={{
                '& .MuiTextField-root': {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'white',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                        },
                    },
                }
            }}>
                <Stack spacing={2}>
                    <TextField
                        label="Treatment Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        InputLabelProps={{ style: { color: 'white' } }}
                        sx={{ input: { color: 'white' } }}
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        InputLabelProps={{ style: { color: 'white' } }}
                        sx={{ textarea: { color: 'white' } }}
                    />
                    <TextField
                        label="Budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(parseFloat(e.target.value))}
                        fullWidth
                        InputLabelProps={{ style: { color: 'white' } }}
                        sx={{ input: { color: 'white' } }}
                    />
                    <TextField
                        label="Enter Keywords for Bidding"
                        variant="outlined"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddKeyword();
                            }
                        }}
                        fullWidth
                        InputProps={{
                            style: { color: 'white' },
                            endAdornment: (
                                <Button
                                    onClick={handleAddKeyword}
                                    sx={{
                                        backgroundColor: '#d45b15',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#b34711',
                                        },
                                        ml: 1,
                                    }}
                                >
                                    Add
                                </Button>
                            ),
                        }}
                        InputLabelProps={{ style: { color: 'white' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#d45b15' },
                                '&:hover fieldset': { borderColor: '#d45b15' },
                                '&.Mui-focused fieldset': { borderColor: '#d45b15' },
                            },
                        }}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {keywords.map((keyword, index) => (
                            <Chip
                                key={index}
                                label={keyword}
                                onDelete={() => handleDeleteKeyword(keyword)}
                                sx={{
                                    backgroundColor: '#d45b15',
                                    color: 'white',
                                    '& .MuiChip-deleteIcon': {
                                        color: 'white',
                                        '&:hover': {
                                            color: '#e0e0e0',
                                        },
                                    },
                                }}
                            />
                        ))}
                    </Stack>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#d45b15', // Color of the thumb when checked
                                        '&:hover': {
                                            backgroundColor: 'rgba(212, 91, 21, 0.08)',
                                        },
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#d45b15', // Color of the track when checked
                                    },
                                }}
                            />
                        }
                        label="Active"
                        sx={{ color: 'white' }}
                    />
                    <Button variant="contained" onClick={handleSave} sx={{
                        backgroundColor: '#d45b15',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#b34711',
                        },
                    }}>
                        Save
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
