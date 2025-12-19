'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

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
    product_url?: string;
}

interface Advertiser {
    id: number;
    name: string;
}

interface AdvertiserContextType {
    // State
    activeAdvertiser: Advertiser | null;
    campaigns: Campaign[];
    selectedFilter: string;
    totalSpend: number;
    aggregateCTR: number;
    totalImpressions: number;
    campaignsLoading: boolean;

    // Actions
    setActiveAdvertiser: (advertiser: Advertiser) => void;
    setSelectedFilter: (filter: string) => void;
    fetchCampaignsForAdvertiser: (advertiser: Advertiser, startDate: string | null, endDate: string | null, force?: boolean) => Promise<void>;
    updateCampaign: (campaignId: number, updates: Partial<Campaign>) => void;
    refreshData: () => Promise<void>;
    clearCache: () => void;
    hasCachedData: (advertiserId: number, startDate: string | null, endDate: string | null) => boolean;
}

const AdvertiserContext = createContext<AdvertiserContextType | undefined>(undefined);

export function AdvertiserProvider({ children }: { children: ReactNode }) {
    const [activeAdvertiser, setActiveAdvertiser] = useState<Advertiser | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedFilter, setSelectedFilter] = useState("Last 7 Days");
    const [totalSpend, setTotalSpend] = useState<number>(0);
    const [aggregateCTR, setAggregateCTR] = useState<number>(0);
    const [totalImpressions, setTotalImpressions] = useState<number>(0);
    const [campaignsLoading, setCampaignsLoading] = useState<boolean>(false);
    const [lastFetchParams, setLastFetchParams] = useState<{
        advertiserId: number | null;
        startDate: string | null;
        endDate: string | null;
    }>({ advertiserId: null, startDate: null, endDate: null });

    const hasCachedData = useCallback((
        advertiserId: number,
        startDate: string | null,
        endDate: string | null
    ) => {
        return (
            campaigns.length > 0 &&
            lastFetchParams.advertiserId === advertiserId &&
            lastFetchParams.startDate === startDate &&
            lastFetchParams.endDate === endDate
        );
    }, [campaigns, lastFetchParams]);

    const fetchCampaignsForAdvertiser = useCallback(async (
        advertiser: Advertiser,
        startDate: string | null,
        endDate: string | null,
        force: boolean = false
    ) => {
        // Skip fetch if data is already cached and force is not true
        if (!force && hasCachedData(advertiser.id, startDate, endDate)) {
            console.log('Using cached data for advertiser:', advertiser.id);
            return;
        }

        try {
            setCampaignsLoading(true);

            // Use the new consolidated endpoint that returns campaigns with stats in a single request
            const queryParams = new URLSearchParams();
            if (startDate) {
                queryParams.append('startDate', startDate);
            }
            if (endDate) {
                queryParams.append('endDate', endDate);
            }
            const queryString = queryParams.toString();

            const response = await axios.get(
                `/api/advertisers/${advertiser.id}/campaigns-with-stats${queryString ? `?${queryString}` : ''}`
            );
            const fetchedCampaigns = response.data.campaigns;

            // Calculate aggregate statistics
            const aggregateSpend = fetchedCampaigns.reduce((total: number, campaign: Campaign) => total + campaign.total_cost, 0);
            setTotalSpend(aggregateSpend);

            const totalImpressionsCount = fetchedCampaigns.reduce((total: number, campaign: Campaign) => total + campaign.impressions_count, 0);
            const totalClicks = fetchedCampaigns.reduce((total: number, campaign: Campaign) => total + campaign.clicks_count, 0);
            const ctr = totalImpressionsCount > 0 ? (totalClicks / totalImpressionsCount) * 100 : 0;
            setAggregateCTR(ctr);
            setTotalImpressions(totalImpressionsCount);

            setCampaigns(fetchedCampaigns);
            setLastFetchParams({ advertiserId: advertiser.id, startDate, endDate });
        } catch (error) {
            console.log("An error occurred fetching campaigns for advertiser: ", error);
        } finally {
            setCampaignsLoading(false);
        }
    }, [hasCachedData]);

    const updateCampaign = useCallback((campaignId: number, updates: Partial<Campaign>) => {
        setCampaigns(prevCampaigns => {
            const updatedCampaigns = prevCampaigns.map(campaign =>
                campaign.id === campaignId
                    ? { ...campaign, ...updates }
                    : campaign
            );

            // Recalculate aggregate statistics if numeric fields are updated
            if (updates.total_cost !== undefined || updates.impressions_count !== undefined || updates.clicks_count !== undefined) {
                const aggregateSpend = updatedCampaigns.reduce((total, campaign) => total + campaign.total_cost, 0);
                setTotalSpend(aggregateSpend);

                const totalImpressionsCount = updatedCampaigns.reduce((total, campaign) => total + campaign.impressions_count, 0);
                const totalClicks = updatedCampaigns.reduce((total, campaign) => total + campaign.clicks_count, 0);
                const ctr = totalImpressionsCount > 0 ? (totalClicks / totalImpressionsCount) * 100 : 0;
                setAggregateCTR(ctr);
                setTotalImpressions(totalImpressionsCount);
            }

            return updatedCampaigns;
        });
    }, []);

    const refreshData = useCallback(async () => {
        if (activeAdvertiser && lastFetchParams.advertiserId === activeAdvertiser.id) {
            await fetchCampaignsForAdvertiser(
                activeAdvertiser,
                lastFetchParams.startDate,
                lastFetchParams.endDate
            );
        }
    }, [activeAdvertiser, lastFetchParams, fetchCampaignsForAdvertiser]);

    const clearCache = useCallback(() => {
        setCampaigns([]);
        setTotalSpend(0);
        setAggregateCTR(0);
        setTotalImpressions(0);
        setLastFetchParams({ advertiserId: null, startDate: null, endDate: null });
    }, []);

    const value: AdvertiserContextType = {
        activeAdvertiser,
        campaigns,
        selectedFilter,
        totalSpend,
        aggregateCTR,
        totalImpressions,
        campaignsLoading,
        setActiveAdvertiser,
        setSelectedFilter,
        fetchCampaignsForAdvertiser,
        updateCampaign,
        refreshData,
        clearCache,
        hasCachedData,
    };

    return (
        <AdvertiserContext.Provider value={value}>
            {children}
        </AdvertiserContext.Provider>
    );
}

export function useAdvertiser() {
    const context = useContext(AdvertiserContext);
    if (context === undefined) {
        throw new Error('useAdvertiser must be used within an AdvertiserProvider');
    }
    return context;
}
