export const hexToDecimal = (hex: string, decimals: number): string => {
    const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
    if (clean === "") return "0";

    const wei: bigint = BigInt("0x" + clean);
    const divisor = BigInt(10) ** BigInt(decimals);

    const whole = wei / divisor;
    const rem = wei % divisor;

    if (rem === BigInt(0)) {
        return whole.toString();
    }

    // build fractional part with leading zeros to match decimals
    const fracRaw = rem.toString().padStart(decimals, "0");
    // trim trailing zeros
    const fracTrimmed = fracRaw.replace(/0+$/g, "");
    return `${whole.toString()}.${fracTrimmed}`;
};

export const keiHexToKaiaDecimal: (hex:string) => string = (hex:string) => {
    return hexToDecimal(hex, 18);
};

export const microUSDTHexToUSDTDecimal = (hex:string) => {
    return hexToDecimal(hex, 6);
};

/**
 * Get appropriate display decimal places based on token decimals
 * @param decimals - Token decimals
 * @returns Number of decimal places to display
 */
export const getDisplayDecimals = (decimals: number): number => {
    if (decimals >= 18) {
        return 6; // For tokens like ETH, WETH, etc.
    } else if (decimals === 8) {
        return 4; // For tokens like WBTC
    } else if (decimals === 6) {
        return 2; // For tokens like USDC, USDT
    } else if (decimals <= 2) {
        return decimals; // For tokens with very few decimals
    } else {
        return 2; // Default fallback
    }
};

/**
 * Format token amount with appropriate decimal places
 * @param amount - Raw amount as string or number
 * @param decimals - Token decimals
 * @returns Formatted amount string
 */
export const formatTokenAmount = (amount: string | number, decimals: number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const displayDecimals = getDisplayDecimals(decimals);
    return numAmount.toFixed(displayDecimals);
};

/**
 * Parse string amount to bigint with proper decimal conversion
 * @param amount - Amount as string (e.g., "1.5", "100", "0.001")
 * @param decimals - Token decimals
 * @returns BigInt representation of the amount
 */
export const parseAmountToBigInt = (amount: string, decimals: number): bigint => {
    if (!amount || amount.trim() === '') {
        return BigInt(0);
    }

    const cleanAmount = amount.trim();
    
    if (!/^[0-9]*\.?[0-9]*$/.test(cleanAmount)) {
        throw new Error(`Invalid amount format: ${amount}`);
    }
    
    const numAmount = parseFloat(cleanAmount);
    
    if (isNaN(numAmount) || numAmount < 0) {
        throw new Error(`Invalid amount: ${amount}`);
    }

    // Use BigInt arithmetic to avoid floating-point precision issues
    const decimalMultiplier = BigInt(10) ** BigInt(decimals);
    
    // Split the amount into integer and fractional parts
    const parts = cleanAmount.split('.');
    const integerPart = parts[0] || '0';
    const fractionalPart = parts[1] || '';
    
    // Convert integer part to BigInt
    const integerBigInt = BigInt(integerPart) * decimalMultiplier;
    
    // Convert fractional part to BigInt (pad or truncate to match decimals)
    let fractionalBigInt = BigInt(0);
    if (fractionalPart.length > 0) {
        const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
        if (paddedFractional.length > 0 && paddedFractional !== '0'.repeat(paddedFractional.length)) {
            const fractionalMultiplier = BigInt(10) ** BigInt(decimals - paddedFractional.length);
            fractionalBigInt = BigInt(paddedFractional) * fractionalMultiplier;
        }
    }
    
    return integerBigInt + fractionalBigInt;
};

/**
 * Parse string amount to bigint with proper decimal conversion (safe version)
 * @param amount - Amount as string (e.g., "1.5", "100", "0.001")
 * @param decimals - Token decimals
 * @returns BigInt representation of the amount, or BigInt(0) if invalid
 */
export const parseAmountToBigIntSafe = (amount: string, decimals: number): bigint => {
    try {
        return parseAmountToBigInt(amount, decimals);
    } catch {
        return BigInt(0);
    }
};

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 * @param value - Number as string or number
 * @returns Formatted number string with suffix
 */
export const formatLargeNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num) || num === 0) {
        return '0';
    }
    
    const absNum = Math.abs(num);
    
    if (absNum >= 1e12) {
        return (num / 1e12).toFixed(2).replace(/\.?0+$/, '') + 'T';
    } else if (absNum >= 1e9) {
        return (num / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
    } else if (absNum >= 1e6) {
        return (num / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
    } else if (absNum >= 1e3) {
        return (num / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'K';
    } else if (absNum >= 1) {
        return num.toFixed(6).replace(/\.?0+$/, '');
    } else {
        return num.toFixed(8).replace(/\.?0+$/, '');
    }
};