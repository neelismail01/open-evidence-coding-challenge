'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, TextField, FormControlLabel, Switch, Chip, IconButton, Snackbar, Alert, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GenericTable from '../../../components/GenericTable';
import { useAdvertiser } from '../../../contexts/AdvertiserContext';
import {
    FILTER_DURATION_1_YEAR,
    FILTER_DURATION_24_HRS,
    FILTER_DURATION_7_DAYS,
    FILTER_DURATION_30_DAYS,
    FILTER_DURATION_ALL_TIME
} from '../../../../utils/constants';

interface Campaign {
    id: number;
    treatment_name: string;
    description: string;
    active: boolean;
    budget: number;
    product_url?: string;
}

interface KeywordBid {
    id: number;
    advertising_category_id: number;
    bid: number;
    active: boolean;
    advertising_categories?: {
        keyword_string: string;
    };
}

interface EditCampaignHeaderProps {
    onClose: () => void;
}

function EditCampaignHeader({ onClose }: EditCampaignHeaderProps) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
                Edit Campaign
            </Typography>
            <IconButton
                onClick={onClose}
                sx={{ color: 'white' }}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    );
}

interface CampaignDetailsFormProps {
    name: string;
    description: string;
    productUrl: string;
    isActive: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onProductUrlChange: (value: string) => void;
    onToggleActive: (value: boolean) => void;
    onUpdateCampaignField: (fieldName: string, value: any) => Promise<void>;
    saveButtonSx: any; // Style prop
    loading?: boolean;
}

function CampaignDetailsForm({
    name,
    description,
    productUrl,
    isActive,
    onNameChange,
    onDescriptionChange,
    onProductUrlChange,
    onToggleActive,
    onUpdateCampaignField,
    saveButtonSx,
    loading = false,
}: CampaignDetailsFormProps) {
    const formFieldStyle = {
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333',
        padding: '20px',
        marginBottom: '16px'
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#333',
            },
            '&:hover fieldset': {
                borderColor: '#d45b15',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#d45b15',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#ccc',
            '&.Mui-focused': {
                color: '#d45b15'
            }
        },
        '& .MuiOutlinedInput-input': {
            color: 'white'
        }
    };

    const loadingBoxStyle = {
        width: '100%',
        height: 56,
        bgcolor: '#525252',
        borderRadius: 1
    };

    return (
        <Box>
            {/* Treatment Name Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ color: 'white', marginBottom: '12px' }}>
                    Treatment Name
                </Typography>
                {loading ? (
                    <Box sx={loadingBoxStyle} />
                ) : (
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <TextField
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            fullWidth
                            placeholder="Enter treatment name"
                            sx={textFieldStyle}
                        />
                        <Button
                            onClick={() => onUpdateCampaignField('treatment_name', name)}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px',
                                height: '56px'
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Description Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ color: 'white', marginBottom: '12px' }}>
                    Description
                </Typography>
                {loading ? (
                    <Box sx={{ ...loadingBoxStyle, height: 92 }} />
                ) : (
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <TextField
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter campaign description"
                            sx={textFieldStyle}
                        />
                        <Button
                            onClick={() => onUpdateCampaignField('description', description)}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px',
                                height: '56px'
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Product URL Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ color: 'white', marginBottom: '12px' }}>
                    Product URL
                </Typography>
                {loading ? (
                    <Box sx={loadingBoxStyle} />
                ) : (
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <TextField
                            value={productUrl}
                            onChange={(e) => onProductUrlChange(e.target.value)}
                            fullWidth
                            placeholder="Enter product URL (e.g., https://example.com/product)"
                            sx={textFieldStyle}
                        />
                        <Button
                            onClick={() => onUpdateCampaignField('product_url', productUrl)}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px',
                                height: '56px'
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Campaign Status */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ color: 'white', marginBottom: '12px' }}>
                    Campaign Status
                </Typography>
                {loading ? (
                    <Box sx={{ ...loadingBoxStyle, height: 42 }} />
                ) : (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isActive}
                                onChange={(e) => onToggleActive(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#d45b15',
                                        '&:hover': {
                                            backgroundColor: 'rgba(212, 91, 21, 0.08)',
                                        },
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#d45b15',
                                    },
                                }}
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Typography sx={{ color: 'white' }}>
                                    Active Campaign
                                </Typography>
                                <Chip
                                    label={isActive ? "Running" : "Paused"}
                                    size="small"
                                    sx={{
                                        backgroundColor: isActive ? '#67e077' : '#d6857a',
                                        color: isActive ? '#022907' : '#6b1206',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        }
                    />
                )}
            </Box>
        </Box>
    );
}

interface KeywordBidManagerProps {
    keywordInput: string;
    bidInput: number;
    categories: KeywordBid[];
    onKeywordInputChange: (value: string) => void;
    onBidInputChange: (value: number) => void;
    onAddKeyword: () => Promise<void>;
    onDeleteKeyword: (keyword: string) => Promise<void>;
    onUpdateBid: (keyword: string, newBid: number) => Promise<void>;
    loading?: boolean;
}

function KeywordBidManager({
    keywordInput,
    bidInput,
    categories,
    onKeywordInputChange,
    onBidInputChange,
    onAddKeyword,
    onDeleteKeyword,
    onUpdateBid,
    loading = false,
}: KeywordBidManagerProps) {
    const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
    const [editBidValue, setEditBidValue] = useState<number>(0);

    const loadingBoxStyle = {
        width: '100%',
        height: 56,
        bgcolor: '#525252',
        borderRadius: 1
    };

    const handleStartEdit = (keyword: string, currentBid: number) => {
        setEditingKeyword(keyword);
        setEditBidValue(currentBid);
    };

    const handleCancelEdit = () => {
        setEditingKeyword(null);
        setEditBidValue(0);
    };

    const handleSaveEdit = async (keyword: string) => {
        if (editBidValue > 0) {
            await onUpdateBid(keyword, editBidValue);
            setEditingKeyword(null);
            setEditBidValue(0);
        }
    };

    const keywordColumns = [
        {
            id: 'keyword',
            label: 'Keyword',
            render: (row: KeywordBid) => (
                <Typography sx={{ color: 'white', fontWeight: 'medium' }}>
                    {row.advertising_categories?.keyword_string || `ID: ${row.advertising_category_id}`}
                </Typography>
            ),
            align: 'left' as const
        },
        {
            id: 'bid_amount',
            label: 'Bid Amount',
            render: (row: KeywordBid) => {
                const keyword = row.advertising_categories?.keyword_string || String(row.advertising_category_id);
                const isEditing = editingKeyword === keyword;

                if (isEditing) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TextField
                                type="number"
                                value={editBidValue}
                                onChange={(e) => setEditBidValue(parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{
                                    width: '80px',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#d45b15' },
                                        '&.Mui-focused fieldset': { borderColor: '#d45b15' },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'white',
                                        fontSize: '12px',
                                        padding: '4px 8px'
                                    }
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleSaveEdit(keyword)}
                                disabled={editBidValue <= 0}
                                sx={{
                                    color: '#4caf50',
                                    '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
                                    '&:disabled': { color: '#666' }
                                }}
                            >
                                <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleCancelEdit}
                                sx={{
                                    color: '#ff6b6b',
                                    '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                                }}
                            >
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    );
                }

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Chip
                            label={`$${row.bid.toFixed(2)}`}
                            size="small"
                            sx={{
                                backgroundColor: '#d45b15',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => handleStartEdit(keyword, row.bid)}
                            sx={{
                                color: '#ccc',
                                '&:hover': {
                                    backgroundColor: 'rgba(212, 91, 21, 0.1)',
                                    color: '#d45b15'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>
                );
            },
            align: 'center' as const
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row: KeywordBid) => (
                <IconButton
                    onClick={() => onDeleteKeyword(row.advertising_categories?.keyword_string || String(row.advertising_category_id))}
                    sx={{
                        color: '#ff6b6b',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            color: '#ff5252'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ),
            align: 'center' as const
        }
    ];

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#333',
            },
            '&:hover fieldset': {
                borderColor: '#d45b15',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#d45b15',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#ccc',
            '&.Mui-focused': {
                color: '#d45b15'
            }
        },
        '& .MuiOutlinedInput-input': {
            color: 'white'
        }
    };

    return (
        <Box sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #333',
            padding: '20px',
            marginTop: '20px'
        }}>
            <Typography variant="h6" sx={{ color: 'white', marginBottom: '20px' }}>
                Keywords & Bidding
            </Typography>

            {/* Add Keyword Section */}
            <Box sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #444',
                padding: '16px',
                marginBottom: '20px'
            }}>
                <Typography variant="subtitle1" sx={{ color: 'white', marginBottom: '12px' }}>
                    Add New Keyword
                </Typography>
                {loading ? (
                    <Box sx={loadingBoxStyle} />
                ) : (
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <TextField
                            label="Keyword"
                            variant="outlined"
                            value={keywordInput}
                            onChange={(e) => onKeywordInputChange(e.target.value)}
                            fullWidth
                            placeholder="Enter keyword (e.g., 'cancer treatment')"
                            sx={textFieldStyle}
                        />
                        <TextField
                            label="Bid Amount ($)"
                            variant="outlined"
                            type="number"
                            value={bidInput}
                            onChange={(e) => onBidInputChange(parseFloat(e.target.value) || 0)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    onAddKeyword();
                                }
                            }}
                            placeholder="0.00"
                            sx={{ ...textFieldStyle, width: '150px' }}
                            inputProps={{
                                min: 0,
                                step: 0.01
                            }}
                        />
                        <Button
                            onClick={onAddKeyword}
                            disabled={!keywordInput.trim() || bidInput <= 0}
                            sx={{
                                backgroundColor: '#d45b15',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#b34711',
                                },
                                '&:disabled': {
                                    backgroundColor: '#555',
                                    color: '#999'
                                },
                                minWidth: '100px',
                                height: '56px',
                                fontWeight: 'bold'
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Keywords Table */}
            <Box>
                <Typography variant="subtitle1" sx={{ color: 'white', marginBottom: '12px' }}>
                    Current Keywords {loading ? '' : `(${categories.length})`}
                </Typography>
                {loading ? (
                    <Box sx={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '8px',
                        border: '1px solid #444'
                    }}>
                        <Box sx={{
                            width: '200px',
                            height: '20px',
                            bgcolor: '#525252',
                            borderRadius: 1,
                            margin: '0 auto'
                        }} />
                    </Box>
                ) : categories.length === 0 ? (
                    <Box sx={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '8px',
                        border: '1px solid #444'
                    }}>
                        <Typography sx={{ color: '#888', fontSize: '16px' }}>
                            No keywords added yet. Add your first keyword above to get started.
                        </Typography>
                    </Box>
                ) : (
                    <GenericTable<KeywordBid>
                        data={categories}
                        columns={keywordColumns}
                    />
                )}
            </Box>
        </Box>
    );
}

export default function EditCampaignPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const { updateCampaign } = useAdvertiser();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [budget, setBudget] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [keywordInput, setKeywordInput] = useState<string>('');
    const [bidInput, setBidInput] = useState<number>(0);
    const [categories, setCategories] = useState<KeywordBid[]>([]);
    const [isClosing, setIsClosing] = useState(false);

    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const fetchCampaignAndCategories = async () => {
            try {
                // Fetch campaign details
                const campaignResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}`);
                const campaignData = campaignResponse.data.campaign;
                setCampaign(campaignData);
                setName(campaignData.treatment_name);
                setDescription(campaignData.description);
                setProductUrl(campaignData.product_url || '');
                setIsActive(campaignData.active);
                setBudget(campaignData.budget || 0);

                // Fetch associated categories
                const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
                console.log("categoriesResponse=",categoriesResponse)
                setCategories(categoriesResponse.data.categories);

            } catch (error) {
                console.error('Error fetching campaign or categories:', error);
                showSnackbar('Failed to load campaign data.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignAndCategories();
    }, [params.campaignId]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            router.push('/advertiser');
        }, 300);
    };

    const handleUpdateCampaignField = async (fieldName: string, value: any) => {
        try {
            await axios.patch(`/api/advertisers/campaigns/${params.campaignId}`, {
                [fieldName]: value,
            });
            console.log(`Successfully updated ${fieldName} to ${value}`);

            // Update the context with the new value
            updateCampaign(parseInt(params.campaignId), {
                [fieldName]: value,
            });

            showSnackbar(`${fieldName} updated successfully!`, 'success');
        } catch (error) {
            console.error(`Error updating ${fieldName}:`, error);
            showSnackbar(`Error updating ${fieldName}.`, 'error');
        }
    };

    const handleToggleActive = async (newIsActive: boolean) => {
        setIsActive(newIsActive);
        await handleUpdateCampaignField('active', newIsActive);
    };

    const handleAddKeyword = async () => {
        const trimmedKeyword = keywordInput.trim();
        const keywordExists = categories.some(kb =>
            kb.advertising_categories?.keyword_string === trimmedKeyword
        );

        if (trimmedKeyword !== '' && bidInput > 0 && !keywordExists) {
            try {
                await axios.put(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                    categoryName: trimmedKeyword,
                    bidAmount: bidInput,
                    active: true,
                });

                // Refresh the categories list to get the proper structure with joined data
                const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
                setCategories(categoriesResponse.data.categories);

                setKeywordInput('');
                setBidInput(0);
                showSnackbar(`Keyword "${trimmedKeyword}" added successfully!`, 'success');
            } catch (error: any) {
                console.error('Error adding keyword:', error);
                const errorMessage = error.response?.data?.error || 'Error adding keyword.';
                showSnackbar(errorMessage, 'error');
            }
        } else if (trimmedKeyword === '') {
            showSnackbar('Keyword cannot be empty.', 'error');
        } else if (bidInput <= 0) {
            showSnackbar('Bid amount must be greater than 0.', 'error');
        } else if (keywordExists) {
            showSnackbar('Keyword already exists.', 'error');
        }
    };

    const handleDeleteKeyword = async (keywordToDelete: string) => {
        try {
            await axios.put(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                categoryName: keywordToDelete,
                active: false,
            });

            // Refresh the categories list
            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
            setCategories(categoriesResponse.data.categories);

            showSnackbar(`Keyword "${keywordToDelete}" removed successfully!`, 'success');
        } catch (error: any) {
            console.error('Error deleting keyword:', error);
            const errorMessage = error.response?.data?.error || 'Error removing keyword.';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleUpdateBid = async (keyword: string, newBid: number) => {
        try {
            await axios.put(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                categoryName: keyword,
                bidAmount: newBid,
                active: true,
            });

            // Refresh the categories list to get updated bid amounts
            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
            setCategories(categoriesResponse.data.categories);

            showSnackbar(`Bid for "${keyword}" updated to $${newBid.toFixed(2)}!`, 'success');
        } catch (error: any) {
            console.error('Error updating bid:', error);
            const errorMessage = error.response?.data?.error || 'Error updating bid amount.';
            showSnackbar(errorMessage, 'error');
        }
    };

    const saveButtonSx = {
        backgroundColor: '#d45b15',
        color: 'white',
        '&:hover': {
            backgroundColor: '#b34711',
        },
        ml: 1,
    };

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
                overflow: 'auto',
            }}
        >
            <Container maxWidth="lg" style={{ marginTop: '20px' }}>
                <EditCampaignHeader onClose={handleClose} />
                <CampaignDetailsForm
                    name={name}
                    description={description}
                    productUrl={productUrl}
                    isActive={isActive}
                    onNameChange={setName}
                    onDescriptionChange={setDescription}
                    onProductUrlChange={setProductUrl}
                    onToggleActive={handleToggleActive}
                    onUpdateCampaignField={handleUpdateCampaignField}
                    saveButtonSx={saveButtonSx}
                    loading={loading}
                />

                <KeywordBidManager
                    keywordInput={keywordInput}
                    bidInput={bidInput}
                    categories={categories}
                    onKeywordInputChange={setKeywordInput}
                    onBidInputChange={setBidInput}
                    onAddKeyword={handleAddKeyword}
                    onDeleteKeyword={handleDeleteKeyword}
                    onUpdateBid={handleUpdateBid}
                    loading={loading}
                />
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

interface TimeFilterProps {
    selectedFilter: string;
    setSelectedFilter: (filter: string) => void;
}

function TimeFilter({ selectedFilter, setSelectedFilter }: TimeFilterProps) {
    const menuItemStyle = {
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '14px',
        padding: '12px 16px',
        '&:hover': {
            backgroundColor: '#333',
        },
        '&.Mui-selected': {
            backgroundColor: '#d45b15',
            '&:hover': {
                backgroundColor: '#d45b15',
            }
        }
    };

    return (
        <Box sx={{
            margin: '0 auto 20px auto',
            backgroundColor: '#1a1a1a',
            padding: '16px 20px',
            borderRadius: '8px',
            border: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
        }}>
            <Typography
                style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    minWidth: 'fit-content'
                }}
            >
                Campaign Performance
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
                <Select
                    labelId="filter-select-label"
                    id="filter-select"
                    value={selectedFilter}
                    sx={{
                        color: 'white',
                        fontSize: '14px',
                        height: '42px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#333',
                            borderWidth: '1px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d45b15',
                            borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d45b15',
                        },
                        '.MuiSvgIcon-root': {
                            fill: "white !important",
                            fontSize: '20px'
                        },
                        '& .MuiSelect-select': {
                            paddingTop: '12px',
                            paddingBottom: '12px'
                        }
                    }}
                    onChange={(event: SelectChangeEvent) => {
                        setSelectedFilter(event.target.value);
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                marginTop: '4px'
                            }
                        }
                    }}
                >
                    <MenuItem value={FILTER_DURATION_24_HRS} sx={menuItemStyle}>{FILTER_DURATION_24_HRS}</MenuItem>
                    <MenuItem value={FILTER_DURATION_7_DAYS} sx={menuItemStyle}>{FILTER_DURATION_7_DAYS}</MenuItem>
                    <MenuItem value={FILTER_DURATION_30_DAYS} sx={menuItemStyle}>{FILTER_DURATION_30_DAYS}</MenuItem>
                    <MenuItem value={FILTER_DURATION_1_YEAR} sx={menuItemStyle}>{FILTER_DURATION_1_YEAR}</MenuItem>
                    <MenuItem value={FILTER_DURATION_ALL_TIME} sx={menuItemStyle}>{FILTER_DURATION_ALL_TIME}</MenuItem>
                </Select>
            </FormControl>
        </Box>
    )
}