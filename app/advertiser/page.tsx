'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, 
    SelectChangeEvent,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import Header from '../components/Header';
import { ADVERTISERS } from '../constants';

interface AdvertiseHomeParams {
    mode: string;
    handleModeChange: (event: SelectChangeEvent) => void;
}

interface CampaignTableParams {
    campaigns: Campaign[];
}

interface Advertiser {
    id: number;
    name: string;
}

interface Campaign {
    id: number;
    created_at: string;
    treatment_name: string;
    description: string;
    company_id: number;
    impressions_count: number;
    clicks_count: number;
    active: Boolean;
}

export default function AdvertiserHome({ mode, handleModeChange }: AdvertiseHomeParams) {
    const [activeAdvertiser, setActiveAdvertiser] = useState<Advertiser>(ADVERTISERS[0])
    const [campaignsLoading, setCampaignsLoading] = useState<Boolean>(false);
    const [campaignsForSelectedAdvertiser, setCampaignsForSelectedAdvertiser] = useState<Campaign[]>([]);

    const handleNewConversation = () => {};

    async function fetchCampaignsForAdvertiser(advertiser: Advertiser) {
        try {
            console.log("fetching campaigns for advertiser=", advertiser)
            const response = await axios.get(`/api/advertisers/campaigns?companyId=${advertiser.id}`);
            const data = response.data.campaigns;
            setCampaignsForSelectedAdvertiser(data);
        } catch (error) {
            console.log("An error occurred fetching compaigns for advertiser: ", error);
        } finally {
            setCampaignsLoading(false)
        }
    }

    useEffect(() => {
        if (activeAdvertiser) {
            fetchCampaignsForAdvertiser(activeAdvertiser);
        }
    }, [activeAdvertiser])

    useEffect(() => {
        fetchCampaignsForAdvertiser(activeAdvertiser);
    }, [])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            <Header
                mode={mode}
                handleModeChange={handleModeChange}
                handleNewConversation={handleNewConversation}
                showNewChatButton={false}
                activeAdvertiser={activeAdvertiser}
                setActiveAdvertiser={setActiveAdvertiser}
            />
            {campaignsForSelectedAdvertiser && (
                <CampaignTable campaigns={campaignsForSelectedAdvertiser}/>
            )}
        </Box>
    )
}

const tableRowBodyStyle = {
    borderBottom: '0.25px solid #e0e0e0', 
    color: '#fff', 
    paddingTop: '1px', 
    paddingBottom: '1px',
    fontSize: '13px',
    verticalAlign: 'middle',
    maxWidth: '50px'
}

const tableRowHeaderStyle = {
    borderBottom: '1px solid #e0e0e0', 
    color: '#fff', 
    paddingTop: '1px', 
    paddingBottom: '1px', 
    backgroundColor: '#252626',
    maxWidth: '50px'
}

function CampaignTable({ campaigns }: CampaignTableParams) {
    return (
        <TableContainer component={Paper} sx={{ flex: 1, backgroundColor: 'transparent' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={tableRowHeaderStyle}>Treatment Name</TableCell>
                        <TableCell sx={[tableRowHeaderStyle, { textAlign: 'center' }]}>Status</TableCell>
                        <TableCell sx={[tableRowHeaderStyle, { textAlign: 'center' }]}>Impressions</TableCell>
                        <TableCell sx={[tableRowHeaderStyle, { textAlign: 'center' }]}>Clicks</TableCell>
                        <TableCell sx={[tableRowHeaderStyle, { textAlign: 'center' }]}>Clickthrough Rate</TableCell>
                        <TableCell sx={tableRowHeaderStyle}>Description</TableCell>
                        <TableCell sx={tableRowHeaderStyle}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {campaigns.map((campaign) => (
                    <TableRow
                        key={campaign.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell sx={tableRowBodyStyle}>
                            {campaign.treatment_name.length > 10 ? String(campaign.treatment_name.substring(0, 10)) + "..." : campaign.treatment_name }
                        </TableCell>
                        <TableCell sx={[tableRowBodyStyle, { textAlign: 'center' }]}>
                            {campaign.active ? (
                                <p style={{ fontWeight: 'strong', marginTop: '5px', marginBottom: '5px', padding: '2.5px', backgroundColor: '#67e077', color: '#022907', borderRadius: '5px' }}>Active</p>
                            ) : (
                                <p style={{ fontWeight: 'strong', marginTop: '5px', marginBottom: '5px', padding: '2.5px', backgroundColor: '#d6857a', color: '#6b1206', borderRadius: '5px' }}>Paused</p>
                            )}
                        </TableCell>
                        <TableCell sx={[tableRowBodyStyle, { textAlign: 'center' }]}>
                            {campaign.impressions_count}
                        </TableCell>
                        <TableCell sx={[tableRowBodyStyle, { textAlign: 'center' }]}>
                            {campaign.clicks_count}
                        </TableCell>
                        <TableCell sx={[tableRowBodyStyle, { textAlign: 'center' }]}>
                            {campaign.impressions_count ? String(campaign.clicks_count / campaign.impressions_count * 100) + "%" : String(campaign.impressions_count) + "%"}
                        </TableCell>
                        <TableCell sx={tableRowBodyStyle}>
                            {campaign.description.length > 50 ? campaign.description.substring(0, 50) + "..." : campaign.description}
                        </TableCell>
                        <TableCell sx={[tableRowBodyStyle, { textAlign: 'right' }]}>
                            <MoreVert sx={{ color: 'white', fontSize: '20px', cursor: 'pointer' }} />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}