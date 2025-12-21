'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import StatsLineChart from '../../../components/StatsLineChart';
import GenericTable from '../../../components/GenericTable';
import { getStartAndEndDatesFromFilter } from '@/lib/utils/dateUtils';
import { TimeFilter, MetricsGrid, FullScreenSlideOverlay } from '@/components';
import type { TimeFilterOption } from '@/lib/types';

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

export default function ViewCampaignPage({ params }: { params: { campaignId: string } }) {
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

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

            // Build query parameters
            const queryParams = new URLSearchParams();
            if (startDate) {
                queryParams.append('startDate', startDate);
            }
            if (endDate) {
                queryParams.append('endDate', endDate);
            }
            const queryString = queryParams.toString();
            const statsResponse = await axios.get(`/api/advertisers/campaigns/${campaignId}/stats${queryString ? `?${queryString}` : ''}`);
            const { summary } = statsResponse.data.stats;

            setTotalImpressions(summary.totalImpressions);
            setTotalSpend(summary.totalSpend);
            const ctr = summary.totalImpressions > 0 ? (summary.totalClicks / summary.totalImpressions) * 100 : 0;
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
        router.push('/advertiser');
    };

    return (
        <FullScreenSlideOverlay
            isOpen={true}
            onClose={handleClose}
            title="Analytics"
            closeRoute="/advertiser"
            animationDuration={100}
        >

            {/* Campaign Analytics Section */}
            <TimeFilter
                value={selectedFilter as TimeFilterOption}
                onChange={(filter) => setSelectedFilter(filter)}
                title="Campaign Performance"
            />

            {/* Summary Cards */}
            <MetricsGrid
                metrics={[
                    {
                        title: 'Total Impressions',
                        value: totalImpressions,
                        formatter: (val) => val.toLocaleString(),
                        loading: analyticsLoading,
                    },
                    {
                        title: 'Total Spend',
                        value: totalSpend,
                        formatter: (val) => `$${val.toFixed(2)}`,
                        loading: analyticsLoading,
                    },
                    {
                        title: 'Aggregate CTR',
                        value: aggregateCTR,
                        formatter: (val) => `${val.toFixed(2)}%`,
                        loading: analyticsLoading,
                    },
                ]}
            />

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
                            },
                            sortValue: (row: Category) => {
                                return (row.impressions && row.impressions > 0)
                                    ? ((row.clicks || 0) / row.impressions * 100)
                                    : 0;
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
                            },
                            sortValue: (row: Category) => {
                                return (row.matches && row.matches > 0)
                                    ? ((row.impressions || 0) / row.matches * 100)
                                    : 0;
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
        </FullScreenSlideOverlay>
    );
}

