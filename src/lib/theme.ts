// Global theme configuration for consistent styling across all charts and pages

export const theme = {
	// Color palette
	colors: {
		primary: '#C41E3A',
		secondary: '#1E3A5F',
		accent: '#D4AF37',
		
		// Chart colors (in order of use)
		chart: [
			'#C41E3A', // Red
			'#1E3A5F', // Navy
			'#10B981', // Green
			'#7C3AED', // Purple
			'#F59E0B', // Amber
			'#06B6D4', // Cyan
			'#EC4899', // Pink
			'#8B5CF6', // Violet
		],
		
		// Specific semantic colors
		positive: '#10B981',
		negative: '#EF4444',
		neutral: '#6B7280',
		
		// Quintile colors (Poorest to Richest)
		quintiles: {
			poorest: '#C41E3A', // Poorest - Red
			q2: '#F59E0B',      // 2 - Amber
			q3: '#1E3A5F',      // 3 - Navy
			q4: '#7C3AED',      // 4 - Purple
			richest: '#10B981', // Richest - Green
			// Also keep as array for indexed access
			array: [
				'#C41E3A', // Poorest
				'#F59E0B', // 2
				'#1E3A5F', // 3
				'#7C3AED', // 4
				'#10B981', // Richest
			]
		},
		
		// Economic outlook colors
		outlook: {
			improving: '#10B981',
			stable: '#3B82F6',
			declining: '#EF4444',
		},
		
		// Background and surface
		background: '#FAFAFA',
		surface: '#FFFFFF',
		border: '#E5E7EB',
		
		// Text
		text: {
			primary: '#111827',
			secondary: '#4B5563',
			muted: '#9CA3AF',
		}
	},
	
	// Typography
	fonts: {
		family: {
			sans: 'Inter, system-ui, -apple-system, sans-serif',
			mono: 'JetBrains Mono, Consolas, monospace',
		},
		size: {
			xs: '0.75rem',    // 12px
			sm: '0.875rem',   // 14px
			base: '1rem',     // 16px
			lg: '1.125rem',   // 18px
			xl: '1.25rem',    // 20px
			'2xl': '1.5rem',  // 24px
		},
		weight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		}
	},
	
	// Spacing
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
	},
	
	// Border radius
	radius: {
		sm: '0.375rem',
		md: '0.5rem',
		lg: '1rem',
		full: '9999px',
	},
	
	// Shadows
	shadows: {
		sm: '0 1px 2px rgba(0,0,0,0.05)',
		md: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
		lg: '0 4px 12px rgba(0,0,0,0.1)',
	},
	
	// Chart defaults
	chart: {
		margin: { top: 30, right: 30, bottom: 50, left: 60 },
		height: {
			sm: 250,
			md: 350,
			lg: 450,
		},
		gridColor: '#F3F4F6',
		axisColor: '#E5E7EB',
		tooltipBg: '#FFFFFF',
	}
};

// Helper to get color by index (wraps around)
export function getChartColor(index: number): string {
	return theme.colors.chart[index % theme.colors.chart.length];
}

// Helper to get quintile color
export function getQuintileColor(quintile: number | string): string {
	const idx = typeof quintile === 'string' 
		? ['Poorest', '2', '3', '4', 'Richest'].indexOf(quintile)
		: quintile - 1;
	return theme.colors.quintiles.array[Math.max(0, Math.min(4, idx))];
}

export default theme;
