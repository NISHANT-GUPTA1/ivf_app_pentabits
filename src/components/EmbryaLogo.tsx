import React from 'react';

interface EmbryaLogoProps {
    width?: number;
    height?: number;
    className?: string;
}

export function EmbryaLogo({ width = 120, height = 40, className = '' }: EmbryaLogoProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* DNA Helix Icon */}
            <g transform="translate(0, 5)">
                <circle cx="8" cy="15" r="3" fill="#3B82F6" />
                <circle cx="16" cy="5" r="2.5" fill="#60A5FA" />
                <circle cx="8" cy="25" r="2.5" fill="#60A5FA" />
                <path
                    d="M 6 15 Q 12 10, 16 5 M 10 15 Q 12 20, 8 25"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    fill="none"
                />
            </g>

            {/* Text */}
            <text
                x="28"
                y="25"
                fontFamily="Arial, sans-serif"
                fontSize="20"
                fontWeight="bold"
                fill="#1E293B"
            >
                Embrya
            </text>
            <text
                x="28"
                y="34"
                fontFamily="Arial, sans-serif"
                fontSize="8"
                fill="#64748B"
                letterSpacing="1"
            >
                VIABILITY ANALYSIS
            </text>
        </svg>
    );
}

// Export as base64 for PDF use
export function getEmbryaLogoBase64(): string {
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 5)">
                <circle cx="8" cy="15" r="3" fill="#3B82F6" />
                <circle cx="16" cy="5" r="2.5" fill="#60A5FA" />
                <circle cx="8" cy="25" r="2.5" fill="#60A5FA" />
                <path d="M 6 15 Q 12 10, 16 5 M 10 15 Q 12 20, 8 25" stroke="#3B82F6" stroke-width="1.5" fill="none" />
            </g>
            <text x="28" y="25" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1E293B">Embrya</text>
            <text x="28" y="34" font-family="Arial, sans-serif" font-size="8" fill="#64748B" letter-spacing="1">VIABILITY ANALYSIS</text>
        </svg>
    `)}`;
}
