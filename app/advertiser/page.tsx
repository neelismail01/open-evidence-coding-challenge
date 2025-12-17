'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Box, Container, FormControl, MenuItem, Select, SelectChangeEvent, Typography
} from '@mui/material';

import Header from '../components/Header';
import {
    ADVERTISERS,
    FILTER_DURATION_1_YEAR,
    FILTER_DURATION_24_HRS,
    FILTER_DURATION_7_DAYS,
    FILTER_DURATION_30_DAYS,
    FILTER_DURATION_ALL_TIME
}  from '../../utils/constants';
import GenericTable from '../components/GenericTable';
import StatsLineChart from '../components/StatsLineChart';
import { useAdvertiser } from '../contexts/AdvertiserContext';

const loadingBoxStyle = {
    width: '100%',
    height: 20,
    bgcolor: '#525252',
    borderRadius: 1
};

interface Campaign {
    id: number;
    created_at: string;
    treatment_name: string;
    description: string;
    impressions_count: number;
    clicks_count: number;
    active: boolean;
    total_cost: number;
    cost_per_click: number;
}

interface Advertiser {
    id: number;
    name: string;
}

function getStartAndEndDatesFromFilter(filter: string): [string | null, string | null] {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now; // End date is always now, unless filter is 'All Time'

    switch (filter) {
        case FILTER_DURATION_24_HRS:
            startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            break;
        case FILTER_DURATION_7_DAYS:
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        case FILTER_DURATION_30_DAYS:
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
        case FILTER_DURATION_1_YEAR:
            startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            break;
        case FILTER_DURATION_ALL_TIME:
            return [null, null]; // No date filtering
        default:
            return [null, null]; // Default to all time if filter is unrecognized
    }

    return [startDate ? startDate.toISOString() : null, endDate ? endDate.toISOString() : null];
}



export default function AdvertiserHome() {
    const router = useRouter();
    const {
        activeAdvertiser,
        setActiveAdvertiser,
        campaigns,
        selectedFilter,
        setSelectedFilter,
        totalSpend,
        aggregateCTR,
        totalImpressions,
        campaignsLoading,
        fetchCampaignsForAdvertiser,
        updateCampaign
    } = useAdvertiser();
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const handleNewConversation = () => {};

    // Initialize active advertiser on mount
    useEffect(() => {
        if (!activeAdvertiser && ADVERTISERS.length > 0) {
            setActiveAdvertiser(ADVERTISERS[0]);
        }
    }, [activeAdvertiser, setActiveAdvertiser]);

    // Fetch campaigns when advertiser or filter changes
    useEffect(() => {
        if (activeAdvertiser) {
            const [startDate, endDate] = getStartAndEndDatesFromFilter(selectedFilter);
            fetchCampaignsForAdvertiser(activeAdvertiser, startDate, endDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAdvertiser, selectedFilter]);

    const handleCampaignAction = (action: string, campaign: Campaign) => {
        if (action === 'view') {
            router.push(`/advertiser/view/${campaign.id}`);
        } else if (action === 'edit') {
            router.push(`/advertiser/edit/${campaign.id}`);
        }
    };

    const campaignMenuActions = [
        { label: 'View More Info', action: 'view' },
        { label: 'Edit Campaign', action: 'edit' }
    ];

    const campaignColumns = [
        {
            id: 'treatment_name',
            label: 'Treatment Name',
            align: 'center' as const,
            tooltip: 'Name of the advertising campaign',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : (campaign.treatment_name.length > 10 ? String(campaign.treatment_name.substring(0, 10)) + "..." : campaign.treatment_name)
        },
        {
            id: 'impressions_count',
            label: 'Impressions',
            align: 'center' as const,
            tooltip: 'Number of times campaign ads were displayed',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : campaign.impressions_count
        },
        {
            id: 'clicks_count',
            label: 'Clicks',
            align: 'center' as const,
            tooltip: 'Number of times campaign ads were clicked',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : campaign.clicks_count
        },
        {
            id: 'ctr',
            label: 'Clickthrough Rate',
            align: 'center' as const,
            tooltip: 'Percentage of impressions that resulted in clicks',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : (
                campaign.impressions_count ? String((campaign.clicks_count / campaign.impressions_count * 100).toFixed(2)) + "%" : String(campaign.impressions_count.toFixed(2)) + "%"
            )
        },
        {
            id: 'cost_per_click',
            label: 'Cost-Per-Click',
            align: 'center' as const,
            tooltip: 'Average amount spent per click',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : (
                "$" + campaign.cost_per_click.toFixed(2)
            )
        },
        {
            id: 'total_cost',
            label: 'Total Spend',
            align: 'center' as const,
            tooltip: 'Total amount spent on this campaign',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : (
                "$" + campaign.total_cost.toFixed(2)
            )
        },
        {
            id: 'status',
            label: 'Status',
            align: 'center' as const,
            tooltip: 'Whether the campaign is currently active or paused',
            render: (campaign: Campaign) => campaignsLoading ? <Box sx={ loadingBoxStyle } /> : (
                campaign.active ? (
                    <p style={{ fontWeight: 'strong', marginTop: '5px', marginBottom: '5px', padding: '2.5px', backgroundColor: '#67e077', color: '#022907', borderRadius: '5px' }}>Active</p>
                ) : (
                    <p style={{ fontWeight: 'strong', marginTop: '5px', marginBottom: '5px', padding: '2.5px', backgroundColor: '#d6857a', color: '#6b1206', borderRadius: '5px' }}>Paused</p>
                )
            )
        },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            <Header
                handleNewConversation={handleNewConversation}
                showNewChatButton={false}
                activeAdvertiser={activeAdvertiser}
                setActiveAdvertiser={setActiveAdvertiser}
            />
            <Container maxWidth="lg" style={{ marginTop: '20px' }}>
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
                        {campaignsLoading ? (
                            <Box sx={{
                                width: '150px',
                                height: '40px',
                                bgcolor: '#525252',
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
                        {campaignsLoading ? (
                            <Box sx={{
                                width: '150px',
                                height: '40px',
                                bgcolor: '#525252',
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
                        {campaignsLoading ? (
                            <Box sx={{
                                width: '150px',
                                height: '40px',
                                bgcolor: '#525252',
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
                    isLoading={campaignsLoading}
                    advertiserId={activeAdvertiser?.id || 0}
                />
                {campaigns && (
                    <GenericTable
                        data={campaignsLoading ? Array.from({ length: 1 }).map((_, index) => ({ id: index })) : campaigns as any[]}
                        columns={campaignColumns}
                        onRowAction={handleCampaignAction}
                        campaignSpecificActions={true}
                        ref={tableContainerRef}
                        isLoading={campaignsLoading}
                        menuActions={campaignMenuActions}
                    />
                )}
            </Container>
        </Box>
    )
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
                Advertising Performance
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