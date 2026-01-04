<script lang="ts">
	import { PageLayout, Icon } from '$lib/components';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Methodology | Listening to Indonesia</title>
</svelte:head>

<PageLayout 
	title="Listening to Indonesia"
	subtitle="Survey Methodology"
	color="#C41E3A"
>
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Introduction -->
			<div class="card p-8">
				<p class="text-lg text-gray-700 leading-relaxed mb-6">
					Listening to Indonesia is a joint Bappenas-World Bank program that tracks household welfare, economic conditions, and public sentiment through a nationally representative monthly panel survey.
				</p>
				<p class="text-gray-600 leading-relaxed mb-6">
					We visited 1000 communities across the country in person, and randomly selected households in each to participate in a monthly survey conducted over the phone. We interview the same households every month, building a high-frequency picture of how living conditions, economic activity, and public perceptions are changing.
				</p>
				<p class="text-gray-600 leading-relaxed">
					When a household stops participating, it is replaced by another from the same community so that the survey remains representative over time.
				</p>
			</div>
			
			<!-- What is L2I -->
			<div class="card p-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">What is Listening to Indonesia?</h2>
				<ul class="space-y-3">
					<li class="flex items-start gap-3">
						<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
							<Icon name="check" size={14} className="text-primary" />
						</div>
						<span class="text-gray-600">A nationally representative monthly survey on social and economic well-being</span>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
							<Icon name="check" size={14} className="text-primary" />
						</div>
						<span class="text-gray-600">Measures the impact of policies and reforms with only a short time lag</span>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
							<Icon name="check" size={14} className="text-primary" />
						</div>
						<span class="text-gray-600">Blends welfare monitoring with polling questions on the drivers of change</span>
					</li>
					<li class="flex items-start gap-3">
						<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
							<Icon name="check" size={14} className="text-primary" />
						</div>
						<span class="text-gray-600">Interviews with people from all walks of life, across regions, and between rural and urban areas</span>
					</li>
				</ul>
			</div>
			
			<!-- Who is this for -->
			<div class="card p-8">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Who is this site for?</h2>
				<p class="text-gray-600 leading-relaxed">
					This site is designed for policymakers, researchers, journalists, and civil society organizations who need timely evidence on how households are faring. It presents headline indicators, interactive charts, and technical notes so that both non-technical and technical audiences can use the findings in their work.
				</p>
			</div>
		</div>
		
		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- At a Glance Card -->
			<div class="card p-6">
				<h3 class="font-bold text-gray-900 mb-4">At a Glance</h3>
				<div class="space-y-4">
					<div class="flex items-center gap-3">
						<Icon name="users" size={20} className="text-gray-500" />
						<span class="text-sm text-gray-600">~2000 households monthly</span>
					</div>
					<div class="flex items-center gap-3">
						<Icon name="globe" size={20} className="text-gray-500" />
						<span class="text-sm text-gray-600">Nationally representative</span>
					</div>
					<div class="flex items-center gap-3">
						<Icon name="phone" size={20} className="text-gray-500" />
						<span class="text-sm text-gray-600">Phone based panel survey</span>
					</div>
					<div class="flex items-center gap-3">
						<Icon name="calendar" size={20} className="text-gray-500" />
						<span class="text-sm text-gray-600">Running since March 2024</span>
					</div>
				</div>
			</div>
			
			<!-- Partners Card -->
			<div class="card p-6">
				<h3 class="font-bold text-gray-900 mb-4">Partners</h3>
				<div class="space-y-3">
					<div class="text-sm text-gray-600">
						<strong class="text-gray-900">Bappenas</strong><br>
						Ministry of National Development Planning
					</div>
					<div class="text-sm text-gray-600">
						<strong class="text-gray-900">World Bank</strong><br>
						Poverty and Equity Global Practice
					</div>
				</div>
			</div>
			
			<!-- Back to Home -->
			<a href="{base}/" class="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
				<Icon name="arrow-right" size={16} className="text-gray-400 rotate-180" />
				<span class="text-sm font-medium text-gray-700">Back to Dashboard</span>
			</a>
		</div>
	</div>
</PageLayout>
