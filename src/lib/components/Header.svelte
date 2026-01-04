<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	
	export let title = 'Listening to Indonesia';
	export let logoSrc = '';
	export let navLinks: Array<{ label: string; href: string }> = [];
	
	let mobileMenuOpen = false;
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	$: currentPath = $page.url.pathname;
</script>

<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo and Title -->
			<a href="{base}/" class="flex items-center gap-3 group" on:click={closeMobileMenu}>
				{#if logoSrc}
					<img 
						src="{base}/{logoSrc}" 
						alt="Logo" 
						class="h-10 w-auto transition-transform group-hover:scale-105"
					/>
				{/if}
				<span class="font-extrabold text-lg sm:text-xl tracking-tight" style="color: #C41E3A;">
					LISTENING TO INDONESIA
				</span>
			</a>
			
			<!-- Desktop Navigation -->
			<nav class="hidden lg:flex items-center gap-1">
				{#each navLinks as link}
					<a
						href="{base}{link.href}"
						class="px-3 py-2 rounded-lg text-sm font-medium transition-all
							{currentPath === `${base}${link.href}` || currentPath === link.href
								? 'text-primary bg-primary/5'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			
			<!-- Mobile Menu Button -->
			<button
				type="button"
				class="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
				on:click={toggleMobileMenu}
				aria-expanded={mobileMenuOpen}
				aria-label="Toggle navigation menu"
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
	
	<!-- Mobile Navigation -->
	{#if mobileMenuOpen}
		<div class="lg:hidden border-t border-gray-100 bg-white shadow-lg">
			<nav class="max-w-[1600px] mx-auto px-4 py-3 space-y-1">
				{#each navLinks as link}
					<a
						href="{base}{link.href}"
						class="block px-4 py-3 rounded-lg text-base font-medium transition-colors
							{currentPath === `${base}${link.href}` || currentPath === link.href
								? 'text-primary bg-primary/5'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
						on:click={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
