import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/base/button"

interface ApprovalActionButtonsProps {
    onApproveClick: () => void;
    onRejectClick: () => void;
}

export function ApprovalActionButtons({ onApproveClick, onRejectClick }: ApprovalActionButtonsProps) {
    return (
        <div className="flex gap-3">
            <Button 
                onClick={onApproveClick}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
            >
                <CheckCircle2 className="h-4 w-4" /> Setujui
            </Button>
            <Button 
                onClick={onRejectClick}
                variant="outline"
                className="flex-1 h-10 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold rounded-xl gap-2"
            >
                <XCircle className="h-4 w-4" /> Tolak
            </Button>
        </div>
    )
}
