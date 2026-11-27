"use client";

import { useState } from "react";
import { Checkbox } from "@/components/base/checkbox";
import { Label } from "@/components/base/label";
import { Button } from "@/components/base/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/base/dialog";

interface ChecklistItemProps {
    itemId: string;
    title: string;
    isChecked: boolean;
    onToggle: (itemId: string, newCheckedState: boolean) => Promise<void>;
}

export function ChecklistItem({ itemId, title, isChecked, onToggle }: ChecklistItemProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingState, setPendingState] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleCheckboxChange = (checked: boolean) => {
        setPendingState(checked);
        setIsConfirmOpen(true);
    };

    const confirmToggle = async () => {
        setIsUpdating(true);
        try {
            await onToggle(itemId, pendingState);
            setIsConfirmOpen(false);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
                <Checkbox 
                    id={`checklist-${itemId}`} 
                    checked={isChecked} 
                    onCheckedChange={handleCheckboxChange} 
                />
                <Label htmlFor={`checklist-${itemId}`} className="text-sm font-medium leading-none cursor-pointer">
                    {title}
                </Label>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi</DialogTitle>
                        <DialogDescription>
                            Tandai sebagai {pendingState ? "diselesaikan" : "belum diselesaikan"}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isUpdating}>
                            Batal
                        </Button>
                        <Button onClick={confirmToggle} disabled={isUpdating}>
                            {isUpdating ? "Menyimpan..." : "Ya"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
