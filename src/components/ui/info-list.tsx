import React from 'react';

export interface InfoItem {
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}

export function InfoList({ items }: { items: InfoItem[] }) {
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index}>
                    <h3 className="text-sm font-medium text-muted-foreground">{item.label}</h3>
                    <div className={`mt-1 text-foreground ${item.valueClassName || ''}`}>
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
