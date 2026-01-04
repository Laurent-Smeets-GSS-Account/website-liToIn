<script lang="ts">
	import { logout } from '$lib/stores/auth';
	
	export let organizationName = 'World Bank';
	export let disclaimer = '';
	export let license = '';
	export let year = new Date().getFullYear();
	
	function handleLogout() {
		logout();
	}
</script>

<footer class="bg-gray-900 text-gray-300 mt-auto">
	<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Organization -->
			<div>
				<h3 class="font-display text-xl text-white mb-3">{organizationName}</h3>
				{#if disclaimer}
					<p class="text-sm text-gray-400 leading-relaxed">{disclaimer}</p>
				{/if}
			</div>
			
			<!-- Quick Links -->
			<div>
				<h4 class="font-semibold text-white mb-3">Quick Links</h4>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="https://www.worldbank.org" target="_blank" rel="noopener noreferrer" 
							class="hover:text-white transition-colors">
							World Bank
						</a>
					</li>
					<li>
						<a href="https://microdata.worldbank.org" target="_blank" rel="noopener noreferrer"
							class="hover:text-white transition-colors">
							Microdata Library
						</a>
					</li>
				</ul>
			</div>
			
			<!-- License -->
			<div>
				<h4 class="font-semibold text-white mb-3">License</h4>
				{#if license}
					<p class="text-sm text-gray-400">{license}</p>
				{:else}
					<p class="text-sm text-gray-400">
						Data and visualizations are provided for informational purposes.
					</p>
				{/if}
			</div>
		</div>
		
		<div class="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between text-sm text-gray-500">
			<p>© {year} {organizationName}. All rights reserved.</p>
			<button 
				on:click={handleLogout}
				class="text-gray-500 hover:text-gray-300 transition-colors text-xs"
			>
				Logout
			</button>
		</div>
	</div>
</footer>
