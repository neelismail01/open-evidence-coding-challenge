'use client';

import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface StatsLineChartProps {
    selectedFilter: string;
    isLoading?: boolean;
    advertiserId: number;
    campaignSpecific?: boolean;
}

interface ChartDataPoint {
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
}

interface CampaignStats {
    id: number;
    name: string;
    impressions: number;
    clicks: number;
    spend: number;
}

interface KeywordStats {
    id: number;
    keyword: string;
    impressions: number;
    clicks: number;
    spend: number;
}

export default function StatsLineChart({ selectedFilter, isLoading = false, advertiserId, campaignSpecific = false }: StatsLineChartProps) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [campaignData, setCampaignData] = useState<CampaignStats[]>([]);
    const [keywordData, setKeywordData] = useState<KeywordStats[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    const getStartAndEndDatesFromFilter = (filter: string): [string | null, string | null] => {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = now;

        switch (filter) {
            case 'Last 24 Hours':
                startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                break;
            case 'Last 7 Days':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case 'Last 30 Days':
                startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case 'Last 1 Year':
                startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
                break;
            case 'All Time':
                return [null, null];
            default:
                return [null, null];
        }

        return [startDate ? startDate.toISOString() : null, endDate ? endDate.toISOString() : null];
    };

    const fetchStatsData = async () => {
        try {
            setDataLoading(true);
            const [startDate, endDate] = getStartAndEndDatesFromFilter(selectedFilter);

            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            const apiUrl = campaignSpecific
                ? `/api/advertisers/campaigns/${advertiserId}/stats`
                : `/api/advertisers/${advertiserId}/stats`;

            const response = await axios.get(
                `${apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            );

            const statsData = response.data.stats || {};
            const timeSeriesData = statsData.timeSeriesData || [];
            const campaignStats = statsData.campaignStats || [];
            const keywordStats = statsData.keywordStats || [];

            console.log("StateLineCharts stats=", statsData);

            // Transform the API data to match our chart format
            const transformedData: ChartDataPoint[] = timeSeriesData.map((stat: any) => ({
                date: new Date(stat.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    ...(selectedFilter === 'Last 1 Year' || selectedFilter === 'All Time' ? { year: '2-digit' } : {})
                }),
                impressions: stat.impressions || 0,
                clicks: stat.clicks || 0,
                spend: stat.spend || 0
            }));

            setChartData(transformedData);
            setCampaignData(campaignStats);
            setKeywordData(keywordStats);
        } catch (error) {
            console.error('Error fetching stats data:', error);
            // On error, use empty data
            setChartData([]);
            setCampaignData([]);
            setKeywordData([]);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        fetchStatsData();
    }, [selectedFilter, advertiserId]); // eslint-disable-line react-hooks/exhaustive-deps

    const impressionsData = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: 'Impressions',
                data: chartData.map(d => d.impressions),
                borderColor: '#d45b15',
                backgroundColor: 'rgba(212, 91, 21, 0.1)',
                fill: false,
                tension: 0.1,
            },
        ],
    };

    const clicksData = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: 'Clicks',
                data: chartData.map(d => d.clicks),
                borderColor: '#d45b15',
                backgroundColor: 'rgba(212, 91, 21, 0.1)',
                fill: false,
                tension: 0.1,
            },
        ],
    };

    const getChartOptions = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white',
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: title,
                color: 'white',
                font: {
                    size: 14
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
        },
    });

    // Bar chart data for top 5 campaigns by impressions
    const top5ImpressionsData = {
        labels: campaignData
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 5)
            .map(campaign => campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name),
        datasets: [
            {
                label: 'Impressions',
                data: campaignData
                    .sort((a, b) => b.impressions - a.impressions)
                    .slice(0, 5)
                    .map(campaign => campaign.impressions),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for top 5 campaigns by clicks
    const top5ClicksData = {
        labels: campaignData
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5)
            .map(campaign => campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name),
        datasets: [
            {
                label: 'Clicks',
                data: campaignData
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 5)
                    .map(campaign => campaign.clicks),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for top 5 keywords by impressions
    const top5KeywordImpressionsData = {
        labels: keywordData
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 5)
            .map(keyword => keyword.keyword.length > 15 ? keyword.keyword.substring(0, 15) + '...' : keyword.keyword),
        datasets: [
            {
                label: 'Impressions',
                data: keywordData
                    .sort((a, b) => b.impressions - a.impressions)
                    .slice(0, 5)
                    .map(keyword => keyword.impressions),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for top 5 keywords by clicks
    const top5KeywordClicksData = {
        labels: keywordData
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5)
            .map(keyword => keyword.keyword.length > 15 ? keyword.keyword.substring(0, 15) + '...' : keyword.keyword),
        datasets: [
            {
                label: 'Clicks',
                data: keywordData
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 5)
                    .map(keyword => keyword.clicks),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    // Line chart data for spend over time
    const spendData = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: 'Spend',
                data: chartData.map(d => d.spend),
                borderColor: '#d45b15',
                backgroundColor: 'rgba(212, 91, 21, 0.1)',
                fill: false,
                tension: 0.1,
            },
        ],
    };

    // Bar chart data for top 5 campaigns by spend
    const top5CampaignSpendData = {
        labels: campaignData
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5)
            .map(campaign => campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name),
        datasets: [
            {
                label: 'Spend',
                data: campaignData
                    .sort((a, b) => b.spend - a.spend)
                    .slice(0, 5)
                    .map(campaign => campaign.spend),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for top 5 keywords by spend
    const top5KeywordSpendData = {
        labels: keywordData
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5)
            .map(keyword => keyword.keyword.length > 15 ? keyword.keyword.substring(0, 15) + '...' : keyword.keyword),
        datasets: [
            {
                label: 'Spend',
                data: keywordData
                    .sort((a, b) => b.spend - a.spend)
                    .slice(0, 5)
                    .map(keyword => keyword.spend),
                backgroundColor: '#d45b15',
                borderColor: '#d45b15',
                borderWidth: 1,
            },
        ],
    };

    const getBarChartOptions = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hide legend for bar charts since it's obvious
            },
            title: {
                display: true,
                text: title,
                color: 'white',
                font: {
                    size: 14
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                beginAtZero: true
            },
        },
    });

    const loadingBoxStyle = {
        width: '100%',
        height: '300px',
        bgcolor: '#1a1a1a',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    if (isLoading || dataLoading) {
        return (
            <Box sx={{ marginBottom: '20px', margin: '0 auto 20px auto' }}>
                {/* Impressions charts */}
                <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading impressions chart...</Typography>
                    </Box>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top campaigns by impressions...</Typography>
                    </Box>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top keywords by impressions...</Typography>
                    </Box>
                </Box>
                {/* Clicks charts */}
                <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading clicks chart...</Typography>
                    </Box>

                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top campaigns by clicks...</Typography>
                    </Box>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top keywords by clicks...</Typography>
                    </Box>
                </Box>
                {/* Spend charts */}
                <Box sx={{ display: 'flex', gap: '20px' }}>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading spend chart...</Typography>
                    </Box>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top campaigns by spend...</Typography>
                    </Box>
                    <Box sx={{ ...loadingBoxStyle, flex: 1 }}>
                        <Typography style={{ color: 'white' }}>Loading top keywords by spend...</Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ marginBottom: '20px', margin: '0 auto 20px auto' }}>
            {/* Impressions charts */}
            <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Line data={impressionsData} options={getChartOptions('Impressions')} />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Bar data={campaignSpecific ? top5KeywordImpressionsData : top5ImpressionsData} options={getBarChartOptions(campaignSpecific ? 'Top 5 Keywords by Impressions' : 'Top 5 Campaigns by Impressions')} />
                </Box>
                {!campaignSpecific && (
                    <Box
                        sx={{
                            flex: 1,
                            height: '300px',
                            backgroundColor: '#1a1a1a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}
                    >
                        <Bar data={top5KeywordImpressionsData} options={getBarChartOptions('Top 5 Keywords by Impressions')} />
                    </Box>
                )}
            </Box>

            {/* Clicks charts */}
            <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Line data={clicksData} options={getChartOptions('Clicks')} />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Bar data={campaignSpecific ? top5KeywordClicksData : top5ClicksData} options={getBarChartOptions(campaignSpecific ? 'Top 5 Keywords by Clicks' : 'Top 5 Campaigns by Clicks')} />
                </Box>
                {!campaignSpecific && (
                    <Box
                        sx={{
                            flex: 1,
                            height: '300px',
                            backgroundColor: '#1a1a1a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}
                    >
                        <Bar data={top5KeywordClicksData} options={getBarChartOptions('Top 5 Keywords by Clicks')} />
                    </Box>
                )}
            </Box>
                        {/* Spend charts */}
                        <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Line data={spendData} options={getChartOptions('Spend')} />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        height: '300px',
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                    }}
                >
                    <Bar data={campaignSpecific ? top5KeywordSpendData : top5CampaignSpendData} options={getBarChartOptions(campaignSpecific ? 'Top 5 Keywords by Spend' : 'Top 5 Campaigns by Spend')} />
                </Box>
                {!campaignSpecific && (
                    <Box
                        sx={{
                            flex: 1,
                            height: '300px',
                            backgroundColor: '#1a1a1a',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                        }}
                    >
                        <Bar data={top5KeywordSpendData} options={getBarChartOptions('Top 5 Keywords by Spend')} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}