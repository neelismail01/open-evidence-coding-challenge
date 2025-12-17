'use client';

import { AdvertiserProvider } from '../contexts/AdvertiserContext';

export default function AdvertiserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdvertiserProvider>
            {children}
        </AdvertiserProvider>
    );
}
