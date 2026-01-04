/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: 'var(--color-primary, #C41E3A)',
				secondary: 'var(--color-secondary, #1E3A5F)',
				accent: 'var(--color-accent, #D4AF37)',
				background: 'var(--color-background, #FAFAFA)',
				surface: 'var(--color-surface, #FFFFFF)',
				muted: 'var(--color-muted, #6B7280)',
			},
			fontFamily: {
				sans: ['Fira Sans', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out forwards',
				'slide-up': 'slideUp 0.6s ease-out forwards',
				'scale-in': 'scaleIn 0.3s ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
				'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
			},
			backdropBlur: {
				'glass': '16px',
			},
		},
	},
	plugins: [],
};
