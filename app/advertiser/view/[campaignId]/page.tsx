'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import StatsLineChart from '../../../components/StatsLineChart';
import GenericTable from '../../../components/GenericTable';
import { useAdvertiser } from '../../../contexts/AdvertiserContext';
import {
    FILTER_DURATION_1_YEAR,
    FILTER_DURATION_24_HRS,
    FILTER_DURATION_7_DAYS,
    FILTER_DURATION_30_DAYS,
    FILTER_DURATION_ALL_TIME
} from '../../../../utils/constants';
import { getStartAndEndDatesFromFilter } from '@/lib/utils/dateUtils';

interface Campaign {
    id: number;
    treatment_name: string;
    description: string;
    active: boolean;
    budget: number;
}

interface Category {
    id: number;
    campaign_id: number;
    advertising_category_id: number;
    active: boolean;
    bid: number;
    advertising_categories: {
        category_string: string;
    };
    matches?: number;
    impressions?: number;
    clicks?: number;
    spend?: number;
}

interface ViewCampaignHeaderProps {
    onClose: () => void;
}

function ViewCampaignHeader({ onClose }: ViewCampaignHeaderProps) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
                Analytics
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

export default function ViewCampaignPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    // Analytics state
    const [selectedFilter, setSelectedFilter] = useState("Last 7 Days");
    const [totalSpend, setTotalSpend] = useState<number>(0);
    const [aggregateCTR, setAggregateCTR] = useState<number>(0);
    const [totalImpressions, setTotalImpressions] = useState<number>(0);
    const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);

    async function fetchCampaignAnalytics(campaignId: string, startDate: string | null, endDate: string | null) {
        try {
            setAnalyticsLoading(true);

            const queryParams = new URLSearchParams();
            if (startDate) {
                queryParams.append('startDate', startDate);
            }
            if (endDate) {
                queryParams.append('endDate', endDate);
            }
            const queryString = queryParams.toString();

            const impressionResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/impressions${queryString ? `?${queryString}` : ''}`);
            const impressionsCount = impressionResponse.data.impression_count;

            const clickResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/clicks${queryString ? `?${queryString}` : ''}`);
            const clicksCount = clickResponse.data.click_count;

            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/categories`);
            const categories = categoriesResponse.data.categories;
            let totalCost = 0;
            for (const category of categories) {
                const costResponse = await axios.get(`/api/advertisers/campaigns/categories/${category.id}/cost${queryString ? `?${queryString}` : ''}`);
                totalCost += costResponse.data.total_cost;
            }

            setTotalImpressions(impressionsCount);
            setTotalSpend(totalCost);
            const ctr = impressionsCount > 0 ? (clicksCount / impressionsCount) * 100 : 0;
            setAggregateCTR(ctr);

        } catch (error) {
            console.error('Error fetching campaign analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    }

    async function fetchCategories(campaignId: string, startDate: string | null, endDate: string | null) {
        try {
            setCategoriesLoading(true);

            // Fetch categories
            const categoriesResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/categories`);
            const categories = categoriesResponse.data.categories;

            // Fetch stats
            const queryParams = new URLSearchParams();
            if (startDate) {
                queryParams.append('startDate', startDate);
            }
            if (endDate) {
                queryParams.append('endDate', endDate);
            }
            const queryString = queryParams.toString();

            const statsResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/stats${queryString ? `?${queryString}` : ''}`);
            const categoryStats = statsResponse.data.stats.categoryStats;

            // Merge stats with categories
            const categoriesWithStats = categories.map((category: Category) => {
                const stats = categoryStats.find((stat: any) => stat.id === category.advertising_category_id);
                return {
                    ...category,
                    impressions: stats?.impressions || 0,
                    clicks: stats?.clicks || 0,
                    spend: stats?.spend || 0
                };
            });

            setCategories(categoriesWithStats);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    }

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const campaignResponse = await axios.get(`/api/advertisers/campaigns/${params.campaignId}`);
                const campaignData = campaignResponse.data.campaign;
                setCampaign(campaignData);
            } catch (error) {
                console.error('Error fetching campaign:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [params.campaignId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const [startDate, endDate] = getStartAndEndDatesFromFilter(selectedFilter);
        fetchCampaignAnalytics(params.campaignId, startDate, endDate);
        fetchCategories(params.campaignId, startDate, endDate);
    }, [params.campaignId, selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            router.push('/advertiser');
        }, 300);
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
                {<Box
                        style={{ margin: '20px auto' }}
                    >
                        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
                            <ViewCampaignHeader onClose={handleClose} />

                            {/* Campaign Analytics Section */}
                            <TimeFilter
                                selectedFilter={selectedFilter}
                                setSelectedFilter={setSelectedFilter}
                            />

                            {/* Summary Cards */}
                            <Box sx={{ margin: '0 auto 20px auto', display: 'flex', gap: '20px' }}>
                                {/* Total Impressions Card */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        backgroundColor: '#1a1a1a',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '1px solid #333',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" style={{ color: 'white', marginBottom: '10px' }}>
                                        Total Impressions
                                    </Typography>
                                    {analyticsLoading ? (
                                        <Box sx={{
                                            width: '150px',
                                            height: '40px',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: 1,
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography style={{ color: 'white', fontSize: '14px' }}>Loading...</Typography>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="h4"
                                            style={{
                                                color: '#d45b15',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {totalImpressions.toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Total Spend Card */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        backgroundColor: '#1a1a1a',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '1px solid #333',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" style={{ color: 'white', marginBottom: '10px' }}>
                                        Total Spend
                                    </Typography>
                                    {analyticsLoading ? (
                                        <Box sx={{
                                            width: '150px',
                                            height: '40px',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: 1,
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography style={{ color: 'white', fontSize: '14px' }}>Loading...</Typography>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="h4"
                                            style={{
                                                color: '#d45b15',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            ${totalSpend.toFixed(2)}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Aggregate CTR Card */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        backgroundColor: '#1a1a1a',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '1px solid #333',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" style={{ color: 'white', marginBottom: '10px' }}>
                                        Aggregate CTR
                                    </Typography>
                                    {analyticsLoading ? (
                                        <Box sx={{
                                            width: '150px',
                                            height: '40px',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: 1,
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography style={{ color: 'white', fontSize: '14px' }}>Loading...</Typography>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="h4"
                                            style={{
                                                color: '#d45b15',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {aggregateCTR.toFixed(2)}%
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <StatsLineChart
                                selectedFilter={selectedFilter}
                                isLoading={analyticsLoading}
                                advertiserId={parseInt(params.campaignId)}
                                campaignSpecific={true}
                            />

                            {/* Categories Table */}
                            <Box sx={{ marginTop: '20px' }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'white',
                                        marginBottom: '16px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Campaign Categories
                                </Typography>
                                <GenericTable
                                    data={categories}
                                    columns={[
                                        {
                                            id: 'category',
                                            label: 'Category',
                                            align: 'left',
                                            tooltip: 'Target category for ad matching',
                                            render: (row: Category) => row.advertising_categories?.category_string || 'N/A'
                                        },
                                        {
                                            id: 'bid',
                                            label: 'Bid Amount',
                                            align: 'center',
                                            tooltip: 'Amount willing to pay per impression/click',
                                            render: (row: Category) => `$${row.bid?.toFixed(2) || '0.00'}`
                                        },
                                        {
                                            id: 'impressions',
                                            label: 'Impressions',
                                            align: 'center',
                                            tooltip: 'Times this category won the auction and displayed an ad',
                                            render: (row: Category) => (row.impressions || 0).toLocaleString()
                                        },
                                        {
                                            id: 'clicks',
                                            label: 'Clicks',
                                            align: 'center',
                                            tooltip: 'Number of clicks received for this category',
                                            render: (row: Category) => (row.clicks || 0).toLocaleString()
                                        },
                                        {
                                            id: 'ctr',
                                            label: 'CTR',
                                            align: 'center',
                                            tooltip: 'Click-through rate: clicks divided by impressions',
                                            render: (row: Category) => {
                                                const ctr = (row.impressions && row.impressions > 0)
                                                    ? ((row.clicks || 0) / row.impressions * 100)
                                                    : 0;
                                                return `${ctr.toFixed(2)}%`;
                                            }
                                        },
                                        {
                                            id: 'winRate',
                                            label: 'Win %',
                                            align: 'center',
                                            tooltip: 'Percentage of category matches where this campaign won the auction',
                                            render: (row: Category) => {
                                                const winRate = (row.matches && row.matches > 0)
                                                    ? ((row.impressions || 0) / row.matches * 100)
                                                    : 0;
                                                return `${winRate.toFixed(2)}%`;
                                            }
                                        },
                                        {
                                            id: 'cpc',
                                            label: 'Cost per Click',
                                            align: 'center',
                                            tooltip: 'Average cost per click for this category',
                                            render: (row: Category) => {
                                                const cpc = (row.clicks && row.clicks > 0)
                                                    ? ((row.spend || 0) / row.clicks)
                                                    : 0;
                                                return `$${cpc.toFixed(2)}`;
                                            }
                                        },
                                        {
                                            id: 'spend',
                                            label: 'Total Spend',
                                            align: 'center',
                                            tooltip: 'Total amount spent on this category',
                                            render: (row: Category) => `$${(row.spend || 0).toFixed(2)}`
                                        },
                                        {
                                            id: 'active',
                                            label: 'Status',
                                            align: 'center',
                                            tooltip: 'Whether this category is currently active',
                                            render: (row: Category) => (
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: '4px',
                                                        backgroundColor: row.active ? '#1b5e20' : '#c62828',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {row.active ? 'Active' : 'Inactive'}
                                                </Box>
                                            )
                                        }
                                    ]}
                                    isLoading={categoriesLoading}
                                />
                            </Box>
                        </Container>
                    </Box>
                }
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