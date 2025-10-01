"use client"

import React from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export interface SuccessAlertProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
  txHash?: string
  chainId?: number
}

export function SuccessAlert({
  isOpen,
  onClose,
  title = "Transaction success",
  description = "tx hash: ",
  buttonText = "close",
  onButtonClick,
  className,
  txHash,
  chainId,
}: SuccessAlertProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    }
    onClose()
  }

  // Function to slice tx hash (first 6 and last 4 characters)
  const sliceTxHash = (hash: string) => {
    if (hash.length <= 10) return hash
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  // Function to get block explorer URL based on chain ID
  const getBlockExplorerUrl = (hash: string, chainId?: number) => {
    if (!chainId) return ""
    
    // Always use Moonbeam explorer regardless of chain
    return `https://moonbeam.moonscan.io/tx/${hash}`;
  }

  const blockExplorerUrl = txHash && chainId ? getBlockExplorerUrl(txHash, chainId) : ""

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={cn("max-w-md border shadow-2xl bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]", className)}>
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/beary/user-success.png"
              alt="Beary Success"
              width={120}
              height={120}
              className="animate-happy-bounce"
              priority
            />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-green-600 mb-4 text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed text-center px-4">
            {description}
          </AlertDialogDescription>
          {txHash && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-md">
                {sliceTxHash(txHash)}
              </span>
              {blockExplorerUrl && (
                <a
                  href={blockExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="View on block explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </a>
              )}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center items-center pt-6">
          <AlertDialogAction
            onClick={handleButtonClick}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 mx-auto"
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
