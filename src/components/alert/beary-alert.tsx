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

export type AlertType = "success" | "pending" | "failed" | "info"

export interface BearyAlertProps {
  isOpen: boolean
  onClose: () => void
  type: AlertType
  title?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
  showSparkles?: boolean
}

const alertConfig = {
  success: {
    image: "/beary/user-success.png",
    title: "Transaction success",
    description: "tx hash: ",
    buttonText: "close",
    buttonClass: "bg-green-500 hover:bg-green-600",
    titleClass: "text-green-600",
    animation: "animate-happy-bounce"
  },
  pending: {
    image: "/beary/user-waiting.png",
    title: "Transaksi Sedang Diproses",
    description: "Mohon tunggu sebentar, transaksi Anda sedang diproses. Jangan tutup aplikasi ini ya!",
    buttonText: "Oke, Saya Tunggu",
    buttonClass: "bg-yellow-500 hover:bg-yellow-600",
    titleClass: "text-yellow-600",
    animation: "animate-pulse"
  },
  failed: {
    image: "/beary/user-failed.png",
    title: "Ups, Ada Masalah!",
    description: "Maaf, transaksi Anda gagal diproses. Silakan coba lagi atau hubungi customer service jika masalah berlanjut.",
    buttonText: "Coba Lagi",
    buttonClass: "bg-red-500 hover:bg-red-600",
    titleClass: "text-red-600",
    animation: "animate-shake"
  },
  info: {
    image: "/beary/user-profil.png",
    title: "Informasi Penting",
    description: "Ada informasi penting yang perlu Anda ketahui. Silakan baca dengan seksama.",
    buttonText: "Mengerti",
    buttonClass: "bg-blue-500 hover:bg-blue-600",
    titleClass: "text-blue-600",
    animation: "animate-float"
  }
}

export function BearyAlert({
  isOpen,
  onClose,
  type,
  title,
  description,
  buttonText,
  onButtonClick,
  className,
  showSparkles = true,
}: BearyAlertProps) {
  const config = alertConfig[type]

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
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <Image
                src={config.image}
                alt={`Beary ${type}`}
                width={120}
                height={120}
                className={config.animation}
                priority
              />
              
              {/* Sparkles effect for success */}
              {showSparkles && type === "success" && (
                <>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full animate-sparkle"></div>
                  <div className="absolute top-2 -right-3 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '4s' }}></div>
                </>
              )}
            </div>
          </div>
          
          <AlertDialogTitle className={cn("text-2xl font-bold mb-4 text-center", config.titleClass)}>
            {title || config.title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed text-center px-4">
            {description || config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex justify-center items-center pt-6">
          <AlertDialogAction
            onClick={handleButtonClick}
            className={cn(
              "text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 mx-auto",
              config.buttonClass
            )}
          >
            {buttonText || config.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
