"use client"

import React from "react"
import Image from "next/image"
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

export interface FailedAlertProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
}

export function FailedAlert({
  isOpen,
  onClose,
  title = "Ups, Ada Masalah!",
  description = "Maaf, transaksi Anda gagal diproses. Silakan coba lagi atau hubungi customer service jika masalah berlanjut.",
  buttonText = "Coba Lagi",
  onButtonClick,
  className,
}: FailedAlertProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    }
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={cn("max-w-md border shadow-2xl bg-[var(--electric-blue)]/10 backdrop-blur-xl border-[var(--electric-blue)]", className)}>
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/beary/user-failed.png"
              alt="Beary Failed"
              width={120}
              height={120}
              className="animate-shake"
              priority
            />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-red-600 mb-4 text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed text-center px-4">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center pt-6">
          <AlertDialogAction
            onClick={handleButtonClick}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 w-full max-w-xs"
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
