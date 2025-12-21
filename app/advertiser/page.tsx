'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, Suspense } from 'react';
import { Box, Container } from '@mui/material';

import { ADVERTISERS } from '@/lib/constants';
import GenericTable from '../components/GenericTable';
import StatsLineChart from '../components/StatsLineChart';
import ChatSidebar from '../components/ChatSidebar';
import { useAdvertiser } from '../contexts/AdvertiserContext';
import { getStartAndEndDatesFromFilter } from '@/lib/utils/dateUtils';
import { TimeFilter, MetricsGrid } from '@/components';
import type { TimeFilterOption } from '@/lib/types';

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

function AdvertiserHomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

    const handleNewCampaign = () => {
        router.push('/advertiser/create');
    };

    const handleLogout = () => {
        router.push('/physician');
    };

    // Initialize active advertiser from URL parameter
    useEffect(() => {
        const companyIdParam = searchParams.get('companyId');
        if (companyIdParam) {
            const companyId = parseInt(companyIdParam);
            const advertiser = ADVERTISERS.find(adv => adv.id === companyId);
            if (advertiser) {
                setActiveAdvertiser(advertiser);
            }
        } else if (!activeAdvertiser && ADVERTISERS.length > 0) {
            // Fallback to first advertiser if no URL parameter
            setActiveAdvertiser(ADVERTISERS[0]);
        }
    }, [searchParams, setActiveAdvertiser, activeAdvertiser]);

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
            ),
            sortValue: (campaign: Campaign) => campaign.impressions_count ? (campaign.clicks_count / campaign.impressions_count * 100) : 0
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
                flexDirection: 'row',
                height: '100vh',
            }}
        >
            <ChatSidebar
                handleNewConversation={handleNewCampaign}
                handleLogout={handleLogout}
                tooltipText="New Campaign"
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflowY: 'auto',
                }}
            >
                <Container maxWidth="lg" style={{ marginTop: '20px' }}>
                    <TimeFilter
                        value={selectedFilter as TimeFilterOption}
                        onChange={(filter) => setSelectedFilter(filter)}
                        title={`${activeAdvertiser?.name} Advertising Performance`}
                    />

                    {/* Summary Cards */}
                    <MetricsGrid
                        metrics={[
                            {
                                title: 'Total Impressions',
                                value: totalImpressions,
                                formatter: (val) => val.toLocaleString(),
                                loading: campaignsLoading,
                            },
                            {
                                title: 'Total Spend',
                                value: totalSpend,
                                formatter: (val) => `$${val.toFixed(2)}`,
                                loading: campaignsLoading,
                            },
                            {
                                title: 'Aggregate CTR',
                                value: aggregateCTR,
                                formatter: (val) => `${val.toFixed(2)}%`,
                                loading: campaignsLoading,
                            },
                        ]}
                    />

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
        </Box>
    )
}

export default function AdvertiserHome() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</Box>}>
            <AdvertiserHomeContent />
        </Suspense>
    );
}