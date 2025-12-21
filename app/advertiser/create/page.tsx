'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, FormControlLabel, Switch, Chip, IconButton, Snackbar, Alert, InputAdornment } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GenericTable from '../../components/GenericTable';
import AdvertisementCard from '../../components/AdvertisementCard';
import { useAdvertiser } from '../../contexts/AdvertiserContext';
import { FullScreenSlideOverlay } from '@/components';

interface CategoryBid {
    id?: number;
    advertising_category_id?: number;
    bid: number;
    active: boolean;
    advertising_categories?: {
        category_string: string;
    };
    category_string?: string;
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
            '&[type=number]::-webkit-inner-spin-button, &[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'auto',
                opacity: 1,
                filter: 'invert(1)',
            },
        }
    };

    return (
        <Box>
            {/* Treatment Name Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Treatment Name
                </Typography>
                <TextField
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    fullWidth
                    placeholder="Enter treatment name"
                    sx={textFieldStyle}
                />
            </Box>

            {/* Description Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Description
                </Typography>
                <TextField
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    fullWidth
                    placeholder="Enter campaign description"
                    sx={textFieldStyle}
                />
            </Box>

            {/* Product URL Field */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Product URL
                </Typography>
                <TextField
                    value={productUrl}
                    onChange={(e) => onProductUrlChange(e.target.value)}
                    fullWidth
                    placeholder="Enter product URL (e.g., https://example.com/product)"
                    sx={textFieldStyle}
                />
            </Box>

            {/* Campaign Status */}
            <Box sx={formFieldStyle}>
                <Typography variant="h6" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Campaign Status
                </Typography>
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
                        </Box>
                    }
                />
            </Box>
        </Box>
    );
}

interface AdPreviewProps {
    name: string;
    description: string;
    productUrl: string;
    companyName: string;
}

function AdPreview({ name, description, productUrl, companyName }: AdPreviewProps) {
    const previewBoxStyle = {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #2a2a2a',
        padding: '32px',
        marginBottom: '20px',
        position: 'relative' as const
    };

    // Create a mock ad object for the preview with placeholder text
    const mockAd = {
        id: 0,
        campaign_id: 0,
        campaigns: {
            companies: {
                name: companyName
            },
            description: description || 'Enter a description of your campaign to help physicians understand the treatment...',
            id: 0,
            product_url: productUrl || null,
            treatment_name: name || 'Treatment Name'
        },
        bid: 0
    };

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
        </Box>
    );
}

interface CategoryBidManagerProps {
    categoryInput: string;
    bidInput: number;
    categories: CategoryBid[];
    onCategoryInputChange: (value: string) => void;
    onBidInputChange: (value: number) => void;
    onAddCategory: () => void;
    onDeleteCategory: (category: string) => void;
    onUpdateBid: (category: string, newBid: number) => void;
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
}: CategoryBidManagerProps) {
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editBidValue, setEditBidValue] = useState<number>(0);

    const handleStartEdit = (category: string, currentBid: number) => {
        setEditingCategory(category);
        setEditBidValue(currentBid);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditBidValue(0);
    };

    const handleSaveEdit = (category: string) => {
        if (editBidValue > 0) {
            onUpdateBid(category, editBidValue);
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
                    {row.category_string || row.advertising_categories?.category_string || `ID: ${row.advertising_category_id}`}
                </Typography>
            ),
            align: 'left' as const
        },
        {
            id: 'bid_amount',
            label: 'Bid Amount',
            render: (row: CategoryBid) => {
                const category = row.category_string || row.advertising_categories?.category_string || String(row.advertising_category_id);
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

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    </Box>
                );
            },
            align: 'center' as const
        },
        {
            id: 'active',
            label: 'Active',
            render: (row: CategoryBid) => {
                const category = row.category_string || row.advertising_categories?.category_string || String(row.advertising_category_id);
                return (
                    <Switch
                        checked={row.active}
                        onChange={(e) => {
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
                );
            },
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
            </Box>

            {/* Categories Table */}
            <Box>
                <Typography variant="subtitle1" sx={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>
                    Current Categories ({categories.length})
                </Typography>
                {categories.length === 0 ? (
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

export default function CreateCampaignPage() {
    const router = useRouter();
    const { activeAdvertiser, fetchCampaignsForAdvertiser } = useAdvertiser();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [categoryInput, setcategoryInput] = useState<string>('');
    const [bidInput, setBidInput] = useState<number>(0);
    const [categories, setCategories] = useState<CategoryBid[]>([]);
    const [isCreating, setIsCreating] = useState(false);

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

    const handleClose = () => {
        router.push('/advertiser');
    };

    const handleAddCategory = () => {
        const trimmedCategory = categoryInput.trim();
        const categoryExists = categories.some(kb =>
            kb.category_string === trimmedCategory
        );

        if (trimmedCategory !== '' && bidInput > 0 && !categoryExists) {
            setCategories(prev => [...prev, {
                category_string: trimmedCategory,
                bid: bidInput,
                active: true
            }]);
            setcategoryInput('');
            setBidInput(0);
            showSnackbar(`Category "${trimmedCategory}" added!`, 'success');
        } else if (trimmedCategory === '') {
            showSnackbar('Category cannot be empty.', 'error');
        } else if (bidInput <= 0) {
            showSnackbar('Bid amount must be greater than 0.', 'error');
        } else if (categoryExists) {
            showSnackbar('Category already exists.', 'error');
        }
    };

    const handleDeleteCategory = (categoryToDelete: string) => {
        setCategories(prev => prev.filter(cat => cat.category_string !== categoryToDelete));
        showSnackbar(`Category "${categoryToDelete}" removed!`, 'success');
    };

    const handleUpdateBid = (category: string, newBid: number) => {
        setCategories(prev => prev.map(cat =>
            cat.category_string === category ? { ...cat, bid: newBid } : cat
        ));
        showSnackbar(`Bid for "${category}" updated to $${newBid.toFixed(2)}!`, 'success');
    };

    const handleCreateCampaign = async () => {
        if (!name.trim()) {
            showSnackbar('Campaign name is required.', 'error');
            return;
        }

        if (!description.trim()) {
            showSnackbar('Campaign description is required.', 'error');
            return;
        }

        if (!activeAdvertiser) {
            showSnackbar('No advertiser selected.', 'error');
            return;
        }

        setIsCreating(true);

        try {
            const campaignData = {
                company_id: activeAdvertiser.id,
                treatment_name: name,
                description: description,
                product_url: productUrl || null,
                active: isActive,
                categories: categories.map(cat => ({
                    category_string: cat.category_string,
                    bid: cat.bid,
                    active: cat.active
                }))
            };

            const response = await axios.post('/api/advertisers/campaigns', campaignData);

            showSnackbar('Campaign created successfully!', 'success');

            // Refresh campaigns list
            if (activeAdvertiser) {
                await fetchCampaignsForAdvertiser(activeAdvertiser, null, null, true);
            }

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/advertiser');
            }, 1500);
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            const errorMessage = error.response?.data?.error || 'Error creating campaign.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <FullScreenSlideOverlay
            isOpen={true}
            onClose={handleClose}
            title="Create Campaign"
            closeRoute="/advertiser"
            animationDuration={100}
        >
            <AdPreview
                name={name}
                description={description}
                productUrl={productUrl}
                companyName={activeAdvertiser?.name || 'Company'}
            />
            <CampaignDetailsForm
                name={name}
                description={description}
                productUrl={productUrl}
                isActive={isActive}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                onProductUrlChange={setProductUrl}
                onToggleActive={setIsActive}
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
            />

            {/* Create Campaign Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '32px' }}>
                <Button
                    onClick={handleCreateCampaign}
                    disabled={isCreating || !name.trim() || !description.trim()}
                    sx={{
                        backgroundColor: '#d45b15',
                        color: 'white',
                        fontSize: '16px',
                        padding: '12px 48px',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#b34711',
                        },
                        '&:disabled': {
                            backgroundColor: '#555',
                            color: '#999'
                        },
                    }}
                >
                    {isCreating ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
            </Box>

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
