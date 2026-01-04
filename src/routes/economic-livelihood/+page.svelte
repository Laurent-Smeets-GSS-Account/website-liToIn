<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { 
		InteractiveChart, 
		SankeyChart, 
		HorizontalBarChart,
		GroupedBarChart,
		DraggableGrid
	} from '$lib/components';
	import { loadCSV, loadChartContent } from '$lib/utils';
	import theme from '$lib/theme';
	
	// Chart content from markdown file
	let content: Record<string, string> = {};
	
	// Data state
	let selfReportedPoverty: Record<string, unknown>[] = [];
	let sankeyData: Array<{source: string; target: string; value: number; percentage: number; direction: 'improvement' | 'decline' | 'stable'}> = [];
	let economicOutlook: Record<string, unknown>[] = [];
	let copingStrategies: Record<string, unknown>[] = [];
	let medianIncome: Record<string, unknown>[] = [];
	let medianIncomeByClass: Record<string, unknown>[] = [];
	let individualChars: Record<string, unknown>[] = [];
	let emergencyExpense: Record<string, unknown>[] = [];
	let lifeSatResults: Record<string, unknown>[] = [];
	let selfPoorResults: Record<string, unknown>[] = [];
	
	// Processed data
	let lifeSatisfactionBars: Array<{label: string; value: number; significance: string; pValue: number; category: string}> = [];
	let povertyEntryBars: Array<{label: string; value: number; significance: string; pValue: number; category: string}> = [];
	let emergencyExpenseByQuintile: Record<string, unknown>[] = [];
	
	// Individual characteristics grouped bar data
	let charBarData: Record<string, Array<{group: string; values: {label: string; value: number}[]}>> = {
		pct_looking_work: [],
		pct_part_time: [],
		pct_disability: []
	};
	let selectedCharMetric: 'pct_looking_work' | 'pct_part_time' | 'pct_disability' = 'pct_looking_work';
	let charLatestMonth: string = '';
	let charPrevMonth: string = '';
	
	onMount(async () => {
		// Load chart content from markdown file
		content = await loadChartContent('economic-livelihood');
		
		// Load all data
		selfReportedPoverty = await loadCSV('502_self_reported_poverty_time_series.csv');
		const sankeyRaw = await loadCSV('503_economic_mobility_sankey.csv');
		economicOutlook = await loadCSV('504_economic_outlook_by_quintile.csv');
		copingStrategies = await loadCSV('505_coping_strategies_time_series.csv');
		medianIncome = await loadCSV('506_median_income_by_class.csv');
		individualChars = await loadCSV('507_individual_characteristics_by_class.csv');
		emergencyExpense = await loadCSV('404_emergency_expense_capability.csv');
		
		// Load new regression files
		lifeSatResults = await loadCSV('802_life_satisfaction_regression_results.csv');
		selfPoorResults = await loadCSV('801_self_poor_regression_results.csv');
		
		// Process sankey data
		sankeyData = sankeyRaw.map(row => ({
			source: String(row.current_class),
			target: String(row.future_class),
			value: Number(row.n),
			percentage: Number(row.percentage),
			direction: String(row.direction) as 'improvement' | 'decline' | 'stable'
		}));
		
		// Process median income - pivot to wide format for line chart
		const incomeByQuarter: Record<string, Record<string, number>> = {};
		medianIncome.forEach(row => {
			const quarter = String(row.quarter);
			const classLabel = String(row.clean_class_label);
			const income = Number(row.median_pc_inc_real);
			
			if (!incomeByQuarter[quarter]) {
				incomeByQuarter[quarter] = {};
			}
			incomeByQuarter[quarter][classLabel] = income;
		});
		
		medianIncomeByClass = Object.entries(incomeByQuarter)
			.map(([quarter, classes]) => ({
				quarter,
				Poor: classes['Poor'] || 0,
				'Lower middle class': classes['Lower middle class'] || 0,
				'Upper middle class': classes['Upper middle class'] || 0
			}))
			.sort((a, b) => new Date(a.quarter).getTime() - new Date(b.quarter).getTime());
		
		// Process emergency expense - pivot to wide format by quintile
		const expenseByDate: Record<string, Record<string, number>> = {};
		emergencyExpense.forEach(row => {
			const date = String(row.date);
			const quintileLabel = String(row.quintile_label);
			const pct = Number(row.percentage);
			
			if (!expenseByDate[date]) {
				expenseByDate[date] = {};
			}
			expenseByDate[date][quintileLabel] = pct;
		});
		
		emergencyExpenseByQuintile = Object.entries(expenseByDate)
			.map(([date, quintiles]) => ({
				date,
				Poorest: quintiles['Poorest'] || 0,
				Q2: quintiles['2'] || 0,
				Q3: quintiles['3'] || 0,
				Q4: quintiles['4'] || 0,
				Richest: quintiles['Richest'] || 0
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		
		// Process individual characteristics - create grouped bar data (Latest, Previous, Rolling Avg)
		const charsByDate: Record<string, Record<string, Record<string, number>>> = {};
		individualChars.forEach(row => {
			const date = String(row.date);
			const classLabel = String(row.clean_class_label);
			
			if (!charsByDate[date]) {
				charsByDate[date] = {};
			}
			charsByDate[date][classLabel] = {
				pct_looking_work: Number(row.pct_looking_work),
				pct_part_time: Number(row.pct_part_time),
				pct_disability: Number(row.pct_disability)
			};
		});
		
		// Get sorted dates
		const sortedDates = Object.keys(charsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
		const latestDate = sortedDates[sortedDates.length - 1];
		const prevDate = sortedDates[sortedDates.length - 2];
		const rollingDates = sortedDates.slice(-12); // Last 12 months
		
		// Format month names
		const formatMonth = (dateStr: string) => {
			const d = new Date(dateStr);
			return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		};
		charLatestMonth = formatMonth(latestDate);
		charPrevMonth = formatMonth(prevDate);
		
		// Calculate rolling averages
		const rollingAvg: Record<string, Record<string, number>> = {
			'Poor': { pct_looking_work: 0, pct_part_time: 0, pct_disability: 0 },
			'Lower middle class': { pct_looking_work: 0, pct_part_time: 0, pct_disability: 0 },
			'Upper middle class': { pct_looking_work: 0, pct_part_time: 0, pct_disability: 0 }
		};
		const counts: Record<string, number> = { 'Poor': 0, 'Lower middle class': 0, 'Upper middle class': 0 };
		
		rollingDates.forEach(date => {
			['Poor', 'Lower middle class', 'Upper middle class'].forEach(cls => {
				if (charsByDate[date]?.[cls]) {
					rollingAvg[cls].pct_looking_work += charsByDate[date][cls].pct_looking_work;
					rollingAvg[cls].pct_part_time += charsByDate[date][cls].pct_part_time;
					rollingAvg[cls].pct_disability += charsByDate[date][cls].pct_disability;
					counts[cls]++;
				}
			});
		});
		
		// Divide by counts to get averages
		['Poor', 'Lower middle class', 'Upper middle class'].forEach(cls => {
			if (counts[cls] > 0) {
				rollingAvg[cls].pct_looking_work /= counts[cls];
				rollingAvg[cls].pct_part_time /= counts[cls];
				rollingAvg[cls].pct_disability /= counts[cls];
			}
		});
		
		// Create grouped bar data for each metric
		const classes = ['Poor', 'Lower middle class', 'Upper middle class'];
		const metrics: Array<'pct_looking_work' | 'pct_part_time' | 'pct_disability'> = ['pct_looking_work', 'pct_part_time', 'pct_disability'];
		
		metrics.forEach(metric => {
			charBarData[metric] = [
				{
					group: `Latest\n(${charLatestMonth})`,
					values: classes.map(cls => ({
						label: cls,
						value: charsByDate[latestDate]?.[cls]?.[metric] || 0
					}))
				},
				{
					group: `Previous\n(${charPrevMonth})`,
					values: classes.map(cls => ({
						label: cls,
						value: charsByDate[prevDate]?.[cls]?.[metric] || 0
					}))
				},
				{
					group: 'Rolling Avg\n(12 mo)',
					values: classes.map(cls => ({
						label: cls,
						value: rollingAvg[cls][metric]
					}))
				}
			];
		});
		
		// Process life satisfaction regression results (use variable_label from data)
		lifeSatisfactionBars = lifeSatResults
			.filter(r => Number(r['p.value']) < 0.05)
			.map(r => ({
				label: String(r.variable_label || r.predictor),
				value: Number(r.estimate),
				significance: String(r.significance || ''),
				pValue: Number(r['p.value']),
				category: String(r.category || '')
			}))
			.sort((a, b) => b.value - a.value);
		
		// Process self-reported poverty regression results
		povertyEntryBars = selfPoorResults
			.filter(r => Number(r['p.value']) < 0.05)
			.map(r => ({
				label: String(r.variable_label || r.predictor),
				value: Number(r.estimate),
				significance: String(r.significance || ''),
				pValue: Number(r['p.value']),
				category: String(r.category || '')
			}))
			.sort((a, b) => b.value - a.value);
	});
	
	function formatDateShort(dateStr: string): string {
		if (!dateStr) return '';
		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}
	
	function formatIDR(value: number): string {
		return `IDR ${(value / 1000).toFixed(0)}k`;
	}
</script>

<svelte:head>
	<title>Economic & Livelihood | Listening to Indonesia</title>
</svelte:head>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<nav class="breadcrumb">
			<a href="{base}/">Home</a>
			<span>→</span>
			<span>Economic & Livelihood</span>
		</nav>
		<h1>Economic & Livelihood</h1>
		<p class="subtitle">
			{content['page'] || 'Tracking how Indonesians perceive their economic situation, expectations for the future, and coping strategies'}
		</p>
	</div>
	
	<!-- Content Grid -->
	<DraggableGrid columns={2} gap={24} storageKey="economic-livelihood-layout">
		
		<!-- Card 1: Self-reported poverty -->
		<div class="grid-item" data-card-id="self-poverty" style="grid-column: span 1;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Self-Reported Poverty Over Time</h2>
			<p class="card-desc">{content['self-poverty'] || ''}</p>
			
			{#if selfReportedPoverty.length > 0}
				<InteractiveChart
					data={selfReportedPoverty}
					title=""
					xKey="date"
					yKeys={["percentage"]}
					labels={{ percentage: "Self-reported poor" }}
					xLabel="Month"
					yLabel="Percentage (%)"
					colors={[theme.colors.primary]}
					chartId="self-reported-poverty"
					yFormat={(v) => `${v.toFixed(1)}%`}
					height={340}
				/>
			{/if}
		</div>
		
		<!-- Card 2: Sankey -->
		<div class="grid-item" data-card-id="sankey" style="grid-column: span 1;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Most Indonesians Expect a Better Future</h2>
			<p class="card-desc">{content['sankey'] || ''}</p>
			
			{#if sankeyData.length > 0}
				<SankeyChart
					data={sankeyData}
					title=""
					chartId="economic-mobility-sankey"
					height={340}
				/>
			{/if}
		</div>
		
		<!-- Card 3: Economic Outlook (ALL 6 CHARTS IN ONE CARD) -->
		<div class="grid-item" data-card-id="economic-outlook" style="grid-column: span 2;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Economic Outlook Over Time by Income Quintile</h2>
			<p class="card-desc">{content['economic-outlook'] || ''}</p>
			
			<!-- 6 mini charts in grid -->
			<div class="outlook-grid">
				{#each ["Total", "Poorest", "2", "3", "4", "Richest"] as quintile}
					{@const quintileData = economicOutlook.filter(d => String(d.quintile_label) === quintile)}
					<div class="outlook-cell">
						<h3 class="outlook-label">
							{quintile === "Total" ? "All Households" : quintile === "Poorest" ? "Poorest" : quintile === "Richest" ? "Richest" : `Q${quintile}`}
						</h3>
						{#if quintileData.length > 0}
							<InteractiveChart
								data={quintileData}
								title=""
								xKey="date"
								yKeys={["pct_improving", "pct_stable", "pct_declining"]}
								labels={{ 
									pct_improving: "Improving", 
									pct_stable: "Stable",
									pct_declining: "Declining"
								}}
								xLabel=""
								yLabel=""
								colors={[theme.colors.outlook.improving, theme.colors.outlook.stable, theme.colors.outlook.declining]}
								chartId="outlook-{quintile.toLowerCase()}"
								yFormat={(v) => `${v.toFixed(0)}%`}
								height={180}
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Card 4: Life Satisfaction Correlates -->
		<div class="grid-item" data-card-id="life-sat" style="grid-column: span 1;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Correlates of Life Satisfaction</h2>
			<p class="card-desc">{content['life-sat'] || ''}</p>
			
			{#if lifeSatisfactionBars.length > 0}
				<HorizontalBarChart
					data={lifeSatisfactionBars}
					title=""
					xLabel="Regression Coefficient"
					chartId="life-satisfaction-correlates"
					positiveColor={theme.colors.positive}
					negativeColor={theme.colors.negative}
				/>
			{/if}
		</div>
		
		<!-- Card 5: Poverty Entry/Exit -->
		<div class="grid-item" data-card-id="poverty-entry" style="grid-column: span 1;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Profile of Poverty Entry & Exit</h2>
			<p class="card-desc">{content['poverty-entry'] || ''}</p>
			
			{#if povertyEntryBars.length > 0}
				<HorizontalBarChart
					data={povertyEntryBars}
					title=""
					xLabel="Regression Coefficient"
					chartId="poverty-entry-exit"
					positiveColor={theme.colors.positive}
					negativeColor={theme.colors.negative}
				/>
			{/if}
		</div>
		
		<!-- Card 6: Median Income -->
		<div class="grid-item" data-card-id="median-income" style="grid-column: span 2;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Median Income by Self-Reported Class (Quarterly)</h2>
			<p class="card-desc">{content['median-income'] || ''}</p>
			
			{#if medianIncomeByClass.length > 0}
				<InteractiveChart
					data={medianIncomeByClass}
					title=""
					xKey="quarter"
					yKeys={["Poor", "Lower middle class", "Upper middle class"]}
					labels={{ 
						"Poor": "Poor",
						"Lower middle class": "Lower middle class",
						"Upper middle class": "Upper middle class"
					}}
					xLabel="Quarter"
					yLabel="Median Per Capita Income (Real)"
					colors={[theme.colors.primary, theme.colors.secondary, theme.colors.positive]}
					chartId="median-income-by-class"
					yFormat={formatIDR}
					height={320}
				/>
			{/if}
		</div>
		
		<!-- Card 7: Emergency Expense -->
		<div class="grid-item" data-card-id="emergency-expense" style="grid-column: span 2;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Emergency Expense Capability by Income Quintile</h2>
			<p class="card-desc">{content['emergency-expense'] || ''}</p>
			
			{#if emergencyExpenseByQuintile.length > 0}
				<InteractiveChart
					data={emergencyExpenseByQuintile}
					title=""
					xKey="date"
					yKeys={["Poorest", "Q2", "Q3", "Q4", "Richest"]}
					labels={{ 
						Poorest: "Poorest", 
						Q2: "Q2", 
						Q3: "Q3", 
						Q4: "Q4", 
						Richest: "Richest" 
					}}
					xLabel="Date"
					yLabel="Percentage (%)"
					colors={[theme.colors.quintiles.poorest, theme.colors.quintiles.q2, theme.colors.quintiles.q3, theme.colors.quintiles.q4, theme.colors.quintiles.richest]}
					chartId="emergency-expense"
					yFormat={(v) => `${v.toFixed(0)}%`}
					height={320}
				/>
			{/if}
		</div>
		
		<!-- Card 8: Individual Characteristics by Class -->
		<div class="grid-item" data-card-id="looking-work" style="grid-column: span 1;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<div class="card-header-with-dropdown">
				<div>
					<h2 class="card-title">Individual Characteristics</h2>
					<p class="card-desc">{content['looking-work'] || ''}</p>
				</div>
				<div class="metric-dropdown">
					<select bind:value={selectedCharMetric} class="metric-select">
						<option value="pct_looking_work">Looking for Work</option>
						<option value="pct_part_time">Part-Time</option>
						<option value="pct_disability">Disability</option>
					</select>
				</div>
			</div>
			
			{#if charBarData[selectedCharMetric].length > 0}
				<GroupedBarChart
					data={charBarData[selectedCharMetric]}
					title=""
					yLabel="Percentage (%)"
					colors={[theme.colors.negative, theme.colors.primary, theme.colors.positive]}
					legendLabels={["Poor", "Lower middle", "Upper middle"]}
					chartId="individual-chars"
					height={320}
				/>
			{/if}
		</div>
		
		<!-- Card 9: Coping Strategies -->
		<div class="grid-item" data-card-id="coping-strategies" style="grid-column: span 2;">
			<div class="drag-handle">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
				</svg>
			</div>
			<div class="resize-handle"></div>
			
			<h2 class="card-title">Coping Strategies Over Time</h2>
			<p class="card-desc">{content['coping-strategies'] || ''}</p>
			
			{#if copingStrategies.length > 0}
				<InteractiveChart
					data={copingStrategies}
					title=""
					xKey="date"
					yKeys={["dissave_pct", "unab_pay_util_pct", "sell_asset_pct", "forgo_health_pct"]}
					labels={{ 
						dissave_pct: "Take from savings for basic needs",
						unab_pay_util_pct: "Unable to pay utilities",
						sell_asset_pct: "Sell assets",
						forgo_health_pct: "Forego healthcare exp."
					}}
					xLabel="Month"
					yLabel="Percentage (%)"
					colors={[theme.colors.secondary, theme.colors.positive, "#F59E0B", theme.colors.primary]}
					chartId="coping-strategies"
					yFormat={(v) => `${v.toFixed(1)}%`}
					height={350}
				/>
			{/if}
		</div>
		
	</DraggableGrid>
	
	<!-- Variables Section -->
	<details class="variables-section">
		<summary>Variables Used on This Page</summary>
		<div class="variables-content">
			<div class="var-group">
				<h4>Socioeconomic Self-Classification</h4>
				<ul>
					<li><strong>wb32:</strong> Current self-reported economic class (1=Extreme poor to 5=Rich)</li>
					<li><strong>wb33:</strong> Expected economic class in 5 years</li>
					<li><strong>vw23:</strong> Self-identifies as poor (Yes/No)</li>
				</ul>
			</div>
			<div class="var-group">
				<h4>Financial Situation</h4>
				<ul>
					<li><strong>wb5:</strong> Ability to pay for utilities</li>
					<li><strong>wb7:</strong> Used savings for basic needs</li>
					<li><strong>wb8:</strong> Sold assets for basic needs</li>
					<li><strong>wb10:</strong> Forgone healthcare when needed</li>
				</ul>
			</div>
		</div>
	</details>
</div>

<style>
	.page-container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}
	
	.page-header {
		margin-bottom: 2rem;
	}
	
	.breadcrumb {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}
	
	.breadcrumb a {
		color: #6b7280;
		text-decoration: none;
	}
	
	.breadcrumb a:hover {
		color: #C41E3A;
	}
	
	.breadcrumb span {
		margin: 0 0.5rem;
	}
	
	.page-header h1 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	.subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		max-width: 48rem;
		margin: 0;
	}
	
	/* Card content styling */
	.card-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	.card-desc {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.5;
		margin: 0 0 1rem 0;
	}
	
	/* Economic Outlook section */
	.outlook-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	
	@media (max-width: 1024px) {
		.outlook-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	
	@media (max-width: 640px) {
		.outlook-grid {
			grid-template-columns: 1fr;
		}
	}
	
	.outlook-cell {
		background: #f9fafb;
		border-radius: 0.5rem;
		padding: 0.75rem;
	}
	
	.outlook-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem 0;
		text-align: center;
	}
	
	/* Variables section */
	.variables-section {
		margin-top: 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05);
		border: 1px solid rgba(0,0,0,0.06);
	}
	
	.variables-section summary {
		padding: 1rem 1.5rem;
		font-weight: 600;
		color: #374151;
		cursor: pointer;
		background: #f9fafb;
		border-radius: 1rem;
	}
	
	.variables-section[open] summary {
		border-radius: 1rem 1rem 0 0;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.variables-content {
		padding: 1.5rem;
		display: grid;
		gap: 1.5rem;
	}
	
	@media (min-width: 768px) {
		.variables-content {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	
	.var-group h4 {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem 0;
	}
	
	.var-group ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
	}
	
	/* Card header with dropdown */
	.card-header-with-dropdown {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.metric-dropdown {
		flex-shrink: 0;
	}
	
	.metric-select {
		appearance: none;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1.25rem;
		min-width: 180px;
		transition: all 0.15s ease;
	}
	
	.metric-select:hover {
		border-color: #d1d5db;
		background-color: #f9fafb;
	}
	
	.metric-select:focus {
		outline: none;
		border-color: #C41E3A;
		box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
	}
</style>
