'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, TextField, FormControlLabel, Switch, Chip, IconButton, Snackbar, Alert, InputAdornment, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import GenericTable from '../../../components/GenericTable';
import AdvertisementCard from '../../../components/AdvertisementCard';
import { useAdvertiser } from '../../../contexts/AdvertiserContext';
import { FullScreenSlideOverlay } from '@/components';

interface Campaign {
    id: number;
    treatment_name: string;
    description: string;
    active: boolean;
    budget: number;
    product_url?: string;
}

interface CategoryBid {
    id: number;
    advertising_category_id: number;
    bid: number;
    active: boolean;
    max_bid?: number;
    advertising_categories?: {
        category_string: string;
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
    originalName: string;
    originalDescription: string;
    originalProductUrl: string;
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
    originalName,
    originalDescription,
    originalProductUrl,
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
        padding: '15px',
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
            fontSize: '14px',
            '&.Mui-focused': {
                color: '#d45b15'
            }
        },
        '& .MuiOutlinedInput-input': {
            color: 'white',
            fontSize: '14px',
            height: '10px',
            // Style the numeric input arrows to be white
            '&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'auto',
                opacity: 1,
                filter: 'invert(1)',
            },
        }
    };

    const loadingBoxStyle = {
        width: '100%',
        height: 42,
        bgcolor: '#525252',
        borderRadius: 1
    };

    return (
        <Box>
            {/* Treatment Name Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
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
                            disabled={name === originalName}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px'
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Description Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
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
                            placeholder="Enter campaign description"
                            sx={textFieldStyle}
                        />
                        <Button
                            onClick={() => onUpdateCampaignField('description', description)}
                            disabled={description === originalDescription}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px',
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Product URL Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
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
                            disabled={productUrl === originalProductUrl}
                            sx={{
                                ...saveButtonSx,
                                minWidth: '80px',
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Campaign Status */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
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
                                    {isActive ? "Campaign Active" : "Campaign Paused"}
                                </Typography>
                            </Box>
                        }
                    />
                )}
            </Box>
        </Box>
    );
}

interface AdPreviewProps {
    name: string;
    description: string;
    productUrl: string;
    campaignId: string;
    companyName: string;
    loading?: boolean;
}

function AdPreview({ name, description, productUrl, campaignId, companyName, loading = false }: AdPreviewProps) {
    const previewBoxStyle = {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #2a2a2a',
        padding: '32px',
        marginBottom: '20px',
        position: 'relative' as const
    };

    const loadingBoxStyle = {
        width: '100%',
        height: 200,
        bgcolor: '#525252',
        borderRadius: 1
    };

    // Create a mock ad object for the preview
    const mockAd = name && description ? {
        id: parseInt(campaignId),
        campaign_id: parseInt(campaignId),
        campaigns: {
            companies: {
                name: companyName
            },
            description: description,
            id: parseInt(campaignId),
            product_url: productUrl || null,
            treatment_name: name
        },
        bid: 0
    } : null;

    return (
        <Box sx={previewBoxStyle}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Box sx={{
                        width: '40px',
                        height: '1px',
                        backgroundColor: '#333'
                    }} />
                    <Chip
                        label="PREVIEW"
                        size="small"
                        sx={{
                            backgroundColor: 'transparent',
                            border: '1.5px solid #d45b15',
                            color: '#d45b15',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            height: '24px',
                            letterSpacing: '1px'
                        }}
                    />
                    <Box sx={{
                        width: '40px',
                        height: '1px',
                        backgroundColor: '#333'
                    }} />
                </Box>
                <Typography variant="body2" sx={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '13px',
                    fontStyle: 'italic'
                }}>
                    How your advertisement will appear to physicians
                </Typography>
            </Box>
            {loading ? (
                <Box sx={loadingBoxStyle} />
            ) : (
                <Box sx={{
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '-12px',
                        borderRadius: '30px',
                        padding: '2px',
                        background: 'linear-gradient(135deg, #d45b15 0%, #b34711 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0.3
                    },
                    '& > div': {
                        marginTop: 0,
                        marginBottom: 0
                    },
                }}>
                    <AdvertisementCard ad={mockAd} />
                </Box>
            )}
        </Box>
    );
}

interface CategoryBidManagerProps {
    categoryInput: string;
    bidInput: number;
    categories: CategoryBid[];
    onCategoryInputChange: (value: string) => void;
    onBidInputChange: (value: number) => void;
    onAddCategory: () => Promise<void>;
    onDeleteCategory: (category: string) => Promise<void>;
    onUpdateBid: (category: string, newBid: number) => Promise<void>;
    loading?: boolean;
}

function CategoryBidManager({
    categoryInput,
    bidInput,
    categories,
    onCategoryInputChange,
    onBidInputChange,
    onAddCategory,
    onDeleteCategory,
    onUpdateBid,
    loading = false,
}: CategoryBidManagerProps) {
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editBidValue, setEditBidValue] = useState<number>(0);

    const loadingBoxStyle = {
        width: '100%',
        height: 42,
        bgcolor: '#525252',
        borderRadius: 1
    };

    const handleStartEdit = (category: string, currentBid: number) => {
        setEditingCategory(category);
        setEditBidValue(currentBid);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditBidValue(0);
    };

    const handleSaveEdit = async (category: string) => {
        if (editBidValue > 0) {
            await onUpdateBid(category, editBidValue);
            setEditingCategory(null);
            setEditBidValue(0);
        }
    };

    const categoryColumns = [
        {
            id: 'category',
            label: 'Category',
            render: (row: CategoryBid) => (
                <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'medium' }}>
                    {row.advertising_categories?.category_string || `ID: ${row.advertising_category_id}`}
                </Typography>
            ),
            align: 'left' as const
        },
        {
            id: 'bid_amount',
            label: 'Bid Amount',
            render: (row: CategoryBid) => {
                const category = row.advertising_categories?.category_string || String(row.advertising_category_id);
                const isEditing = editingCategory === category;

                if (isEditing) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TextField
                                type="number"
                                value={editBidValue}
                                onChange={(e) => setEditBidValue(parseFloat(e.target.value) || 0)}
                                size="small"
                                autoFocus
                                sx={{
                                    width: '140px',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#d45b15' },
                                        '&.Mui-focused fieldset': { borderColor: '#d45b15' },
                                        paddingRight: '4px',
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'white',
                                        fontSize: '12px',
                                        padding: '6px 8px',
                                        // Style the numeric input arrows to be white
                                        '&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button': {
                                            WebkitAppearance: 'auto',
                                            opacity: 1,
                                            filter: 'invert(1)',
                                        },
                                    }
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Box sx={{ display: 'flex', gap: '2px' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleSaveEdit(category)}
                                                    disabled={editBidValue <= 0}
                                                    sx={{
                                                        padding: '4px',
                                                        color: '#4caf50',
                                                        '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
                                                        '&:disabled': { color: '#666' }
                                                    }}
                                                >
                                                    <SaveIcon sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={handleCancelEdit}
                                                    sx={{
                                                        padding: '4px',
                                                        color: '#ff6b6b',
                                                        '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                                                    }}
                                                >
                                                    <CancelIcon sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    );
                }

                const maxBid = row.max_bid || 0;
                const isHighestBid = row.bid >= maxBid && maxBid > 0;
                const isBelowMaxBid = row.bid < maxBid;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Chip
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {`$${row.bid.toFixed(2)}`}
                                    <EditIcon
                                        fontSize="small"
                                        sx={{
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                    />
                                </Box>
                            }
                            onClick={() => handleStartEdit(category, row.bid)}
                            size="small"
                            sx={{
                                backgroundColor: '#d45b15',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#b34711'
                                }
                            }}
                        />
                        {isHighestBid && (
                            <Tooltip title="This campaign has the highest bid for this category" arrow>
                                <CheckCircleIcon
                                    sx={{
                                        fontSize: '18px',
                                        color: '#4caf50',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Tooltip>
                        )}
                        {isBelowMaxBid && (
                            <Tooltip title={`This campaign is below the highest bid of $${maxBid.toFixed(2)} for this category`} arrow>
                                <WarningIcon
                                    sx={{
                                        fontSize: '18px',
                                        color: '#ff9800',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                );
            },
            align: 'center' as const
        },
        {
            id: 'active',
            label: 'Active',
            render: (row: CategoryBid) => (
                <Switch
                    checked={row.active}
                    onChange={(e) => {
                        const category = row.advertising_categories?.category_string || String(row.advertising_category_id);
                        if (e.target.checked) {
                            onUpdateBid(category, row.bid);
                        } else {
                            onDeleteCategory(category);
                        }
                    }}
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
            fontSize: '14px',
            '&.Mui-focused': {
                color: '#d45b15'
            }
        },
        '& .MuiOutlinedInput-input': {
            color: 'white',
            fontSize: '14px',
            height: '10px',
            // Style the numeric input arrows to be white
            '&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'auto',
                opacity: 1,
                filter: 'invert(1)',
            },
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
            <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '20px' }}>
                Categories & Bidding
            </Typography>

            {/* Add Category Section */}
            <Box sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #444',
                padding: '16px',
                marginBottom: '20px'
            }}>
                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Add New Category
                </Typography>
                {loading ? (
                    <Box sx={loadingBoxStyle} />
                ) : (
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <TextField
                            label="Category"
                            value={categoryInput}
                            onChange={(e) => onCategoryInputChange(e.target.value)}
                            fullWidth
                            placeholder="Enter category (e.g., 'cancer treatment')"
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
                                    onAddCategory();
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
                            onClick={onAddCategory}
                            disabled={!categoryInput.trim() || bidInput <= 0}
                            sx={{
                                backgroundColor: '#d45b15',
                                color: 'white',
                                fontSize: '14px',
                                '&:hover': {
                                    backgroundColor: '#b34711',
                                },
                                '&:disabled': {
                                    backgroundColor: '#555',
                                    color: '#999'
                                },
                                minWidth: '100px',
                                height: '42px',
                                fontWeight: 'bold'
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Categories Table */}
            <Box>
                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Current Categories {loading ? '' : `(${categories.length})`}
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
                            No categories added yet. Add your first category above to get started.
                        </Typography>
                    </Box>
                ) : (
                    <GenericTable<CategoryBid>
                        data={categories}
                        columns={categoryColumns}
                    />
                )}
            </Box>
        </Box>
    );
}

export default function EditCampaignPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const { updateCampaign, activeAdvertiser } = useAdvertiser();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [budget, setBudget] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [categoryInput, setcategoryInput] = useState<string>('');
    const [bidInput, setBidInput] = useState<number>(0);
    const [categories, setCategories] = useState<CategoryBid[]>([]);

    // Track original values for comparison
    const [originalName, setOriginalName] = useState('');
    const [originalDescription, setOriginalDescription] = useState('');
    const [originalProductUrl, setOriginalProductUrl] = useState('');

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

                // Set original values for comparison
                setOriginalName(campaignData.treatment_name);
                setOriginalDescription(campaignData.description);
                setOriginalProductUrl(campaignData.product_url || '');

                // Fetch associated categories with max bid data
                const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
                console.log("categoriesResponse=",categoriesResponse)
                const sortedCategories = categoriesResponse.data.categories.sort((a: CategoryBid, b: CategoryBid) => {
                    const categoryA = a.advertising_categories?.category_string || '';
                    const categoryB = b.advertising_categories?.category_string || '';
                    return categoryA.localeCompare(categoryB);
                });
                setCategories(sortedCategories);

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
        router.push('/advertiser');
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

            // Update original values after successful save
            if (fieldName === 'treatment_name') {
                setOriginalName(value);
            } else if (fieldName === 'description') {
                setOriginalDescription(value);
            } else if (fieldName === 'product_url') {
                setOriginalProductUrl(value);
            }

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

    const handleAddCategory = async () => {
        const trimmedCategory = categoryInput.trim();
        const categoryExists = categories.some(kb =>
            kb.advertising_categories?.category_string === trimmedCategory
        );

        if (trimmedCategory !== '' && bidInput > 0 && !categoryExists) {
            try {
                await axios.post(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                    categoryName: trimmedCategory,
                    bidAmount: bidInput,
                    active: true,
                });

                // Refresh the categories list to get the proper structure with joined data
                const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
                const sortedCategories = categoriesResponse.data.categories.sort((a: CategoryBid, b: CategoryBid) => {
                    const categoryA = a.advertising_categories?.category_string || '';
                    const categoryB = b.advertising_categories?.category_string || '';
                    return categoryA.localeCompare(categoryB);
                });
                setCategories(sortedCategories);

                setcategoryInput('');
                setBidInput(0);
                showSnackbar(`Category "${trimmedCategory}" added successfully!`, 'success');
            } catch (error: any) {
                console.error('Error adding category:', error);
                const errorMessage = error.response?.data?.error || 'Error adding category.';
                showSnackbar(errorMessage, 'error');
            }
        } else if (trimmedCategory === '') {
            showSnackbar('Category cannot be empty.', 'error');
        } else if (bidInput <= 0) {
            showSnackbar('Bid amount must be greater than 0.', 'error');
        } else if (categoryExists) {
            showSnackbar('Category already exists.', 'error');
        }
    };

    const handleDeleteCategory = async (categoryToDelete: string) => {
        try {
            await axios.put(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                categoryName: categoryToDelete,
                active: false,
            });

            // Refresh the categories list
            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
            const sortedCategories = categoriesResponse.data.categories.sort((a: CategoryBid, b: CategoryBid) => {
                const categoryA = a.advertising_categories?.category_string || '';
                const categoryB = b.advertising_categories?.category_string || '';
                return categoryA.localeCompare(categoryB);
            });
            setCategories(sortedCategories);

            showSnackbar(`Category "${categoryToDelete}" removed successfully!`, 'success');
        } catch (error: any) {
            console.error('Error deleting category:', error);
            const errorMessage = error.response?.data?.error || 'Error removing category.';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleUpdateBid = async (category: string, newBid: number) => {
        try {
            await axios.put(`/api/advertisers/campaigns/${params.campaignId}/categories`, {
                categoryName: category,
                bidAmount: newBid,
                active: true,
            });

            // Refresh the categories list to get updated bid amounts
            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}/categories`);
            const sortedCategories = categoriesResponse.data.categories.sort((a: CategoryBid, b: CategoryBid) => {
                const categoryA = a.advertising_categories?.category_string || '';
                const categoryB = b.advertising_categories?.category_string || '';
                return categoryA.localeCompare(categoryB);
            });
            setCategories(sortedCategories);
            showSnackbar(`Bid for "${category}" updated to $${newBid.toFixed(2)}!`, 'success');
        } catch (error: any) {
            console.error('Error updating bid:', error);
            const errorMessage = error.response?.data?.error || 'Error updating bid amount.';
            showSnackbar(errorMessage, 'error');
        }
    };

    const saveButtonSx = {
        backgroundColor: '#d45b15',
        color: 'white',
        fontSize: '14px',
        height: '42px',
        '&:hover': {
            backgroundColor: '#b34711',
        },
        '&:disabled': {
            backgroundColor: '#555',
            color: '#999',
            cursor: 'not-allowed'
        },
        ml: 1,
    };

    return (
        <FullScreenSlideOverlay
            isOpen={true}
            onClose={handleClose}
            title="Edit Campaign"
            closeRoute="/advertiser"
            animationDuration={100}
        >
                <AdPreview
                    name={name}
                    description={description}
                    productUrl={productUrl}
                    campaignId={params.campaignId}
                    companyName={activeAdvertiser?.name || 'Company'}
                    loading={loading}
                />
                <CampaignDetailsForm
                    name={name}
                    description={description}
                    productUrl={productUrl}
                    isActive={isActive}
                    originalName={originalName}
                    originalDescription={originalDescription}
                    originalProductUrl={originalProductUrl}
                    onNameChange={setName}
                    onDescriptionChange={setDescription}
                    onProductUrlChange={setProductUrl}
                    onToggleActive={handleToggleActive}
                    onUpdateCampaignField={handleUpdateCampaignField}
                    saveButtonSx={saveButtonSx}
                    loading={loading}
                />
                <CategoryBidManager
                    categoryInput={categoryInput}
                    bidInput={bidInput}
                    categories={categories}
                    onCategoryInputChange={setcategoryInput}
                    onBidInputChange={setBidInput}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onUpdateBid={handleUpdateBid}
                    loading={loading}
                />
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
        </FullScreenSlideOverlay>
    );
}