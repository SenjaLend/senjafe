"use client";

import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippageTolerance: number;
  onSlippageChange: (value: number) => void;
  transactionDeadline: number;
  onDeadlineChange: (value: number) => void;
}

const PRESET_SLIPPAGE = [0.1, 0.5, 1.0];

export function SettingsModal({
  isOpen,
  onClose,
  slippageTolerance,
  onSlippageChange,
  transactionDeadline,
  onDeadlineChange,
}: SettingsModalProps) {
  const [customSlippage, setCustomSlippage] = useState('');
  const [customDeadline, setCustomDeadline] = useState(transactionDeadline.toString());

  const handleSlippagePreset = (value: number) => {
    onSlippageChange(value);
    setCustomSlippage('');
  };

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  const handleDeadlineChange = (value: string) => {
    setCustomDeadline(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onDeadlineChange(numValue);
    }
  };

  const getSlippageWarning = (slippage: number) => {
    if (slippage < 0.05) return { type: 'error', message: 'Your transaction may fail' };
    if (slippage < 0.1) return { type: 'warning', message: 'Your transaction may fail' };
    if (slippage > 5) return { type: 'warning', message: 'Your transaction may be frontrun' };
    if (slippage > 1) return { type: 'warning', message: 'High slippage tolerance' };
    return null;
  };

  const slippageWarning = getSlippageWarning(slippageTolerance);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] sm:w-full bg-[var(--electric-blue)]/10 backdrop-blur-xl border border-[var(--electric-blue)]/30">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            Settings
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-[var(--electric-blue)]/20">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slippage Tolerance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-white">Slippage tolerance</h3>
              <Info className="h-4 w-4 text-white/60" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {PRESET_SLIPPAGE.map((preset) => (
                <Button
                  key={preset}
                  variant={slippageTolerance === preset && !customSlippage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSlippagePreset(preset)}
                  className={`text-sm transition-all duration-300 ${
                    slippageTolerance === preset && !customSlippage 
                      ? 'bg-[var(--electric-blue)] text-white hover:bg-[var(--electric-blue)]/80' 
                      : 'bg-[#004488]/50 text-white border-[var(--electric-blue)]/30 hover:bg-[var(--electric-blue)]/20 hover:border-[var(--electric-blue)]/50'
                  }`}
                >
                  {preset}%
                </Button>
              ))}
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippage(e.target.value)}
                  className="text-sm pr-8 bg-[#004488]/50 text-white border-[var(--electric-blue)]/30 placeholder:text-white/40 focus:border-[var(--electric-blue)] focus:ring-[var(--electric-blue)]"
                  step="0.1"
                  min="0"
                  max="50"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-white/70">
                  %
                </span>
              </div>
            </div>

            {slippageWarning && (
              <div className={`text-xs mt-2 flex items-center gap-1 ${
                slippageWarning.type === 'error' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                <Info className="h-3 w-3" />
                {slippageWarning.message}
              </div>
            )}
          </div>

          {/* Transaction deadline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-white">Transaction deadline</h3>
              <Info className="h-4 w-4 text-white/60" />
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={customDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="text-sm flex-1 bg-[#004488]/50 text-white border-[var(--electric-blue)]/30 placeholder:text-white/40 focus:border-[var(--electric-blue)] focus:ring-[var(--electric-blue)]"
                min="1"
              />
              <span className="text-sm text-white/70">minutes</span>
            </div>
            
            <p className="text-xs text-white/60 mt-2">
              Your transaction will revert if it is pending for more than this period of time.
            </p>
          </div>

          {/* MEV Protection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-white">MEV Protection</h3>
              <Info className="h-4 w-4 text-white/60" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[var(--electric-blue)]/20 rounded-lg backdrop-blur-sm border border-[var(--electric-blue)]/30">
              <div>
                <p className="text-sm font-medium text-white">Protect from MEV</p>
                <p className="text-xs text-white/70">Prevents value extraction by block producers</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  defaultChecked
                />
                <div className="w-10 h-6 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] rounded-full shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-5 translate-y-1 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Router */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-white">Auto Router API</h3>
              <Info className="h-4 w-4 text-white/60" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[var(--electric-blue)]/20 rounded-lg backdrop-blur-sm border border-[var(--electric-blue)]/30">
              <div>
                <p className="text-sm font-medium text-white">Use Uniswap Labs API</p>
                <p className="text-xs text-white/70">Find the best route for your trade</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  defaultChecked
                />
                <div className="w-10 h-6 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] rounded-full shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-5 translate-y-1 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
