
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/economic-livelihood" | "/food-insecurity" | "/methodology" | "/other-indicators" | "/public-opinion" | "/services-access" | "/vulnerability";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/economic-livelihood": Record<string, never>;
			"/food-insecurity": Record<string, never>;
			"/methodology": Record<string, never>;
			"/other-indicators": Record<string, never>;
			"/public-opinion": Record<string, never>;
			"/services-access": Record<string, never>;
			"/vulnerability": Record<string, never>
		};
		Pathname(): "/" | "/economic-livelihood" | "/economic-livelihood/" | "/food-insecurity" | "/food-insecurity/" | "/methodology" | "/methodology/" | "/other-indicators" | "/other-indicators/" | "/public-opinion" | "/public-opinion/" | "/services-access" | "/services-access/" | "/vulnerability" | "/vulnerability/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/content/charts/economic-livelihood.md" | "/content/home.md" | "/content/pages/economic-livelihood.md" | "/content/pages/food-insecurity.md" | "/content/pages/other-indicators.md" | "/content/pages/public-opinion.md" | "/content/pages/services-access.md" | "/content/pages/vulnerability.md" | "/content/site.json" | "/content/topics.json" | "/data/101_water_disruption_by_region.csv" | "/data/102_water_disruption_by_quintile.csv" | "/data/103_water_issues_time_series.csv" | "/data/104_alternative_water_sources.csv" | "/data/105_electricity_hours_distribution.csv" | "/data/106_electricity_correlation_matrix.csv" | "/data/201_food_insecurity_by_time_region.csv" | "/data/202_food_insecurity_score_distribution.csv" | "/data/203_food_insecurity_score_by_region.csv" | "/data/204_fies_measures_by_quintile.csv" | "/data/205_fies_transitions_within_households.csv" | "/data/206_regional_fies_radar_latest.csv" | "/data/207_fies_risk_in_high_cost_areas.csv" | "/data/301_food_prices_quantities_by_quintile.csv" | "/data/302_food_prices_by_region.csv" | "/data/303_sembako_price_perception.csv" | "/data/304_inflation_perception.csv" | "/data/401_savings_by_method_quintile.csv" | "/data/402_mean_monthly_savings_by_quintile.csv" | "/data/403_credit_uptake_by_class.csv" | "/data/404_emergency_expense_capability.csv" | "/data/405_financial_indicators_by_quintile.csv" | "/data/406_financial_behaviors_by_business_income.csv" | "/data/407_borrowing_saving_time_series.csv" | "/data/501_economic_class_distribution.csv" | "/data/502_self_reported_poverty_time_series.csv" | "/data/503_economic_mobility_sankey.csv" | "/data/504_economic_outlook_by_quintile.csv" | "/data/505_coping_strategies_time_series.csv" | "/data/506_median_income_by_class.csv" | "/data/507_individual_characteristics_by_class.csv" | "/data/601_fraud_rates_by_quintile.csv" | "/data/602_fraud_loss_amounts_over_time.csv" | "/data/603_trust_in_banking_institutions.csv" | "/data/604_fraud_reporting_channels.csv" | "/data/701_economic_conditions_perception.csv" | "/data/702_economic_conditions_by_quintile.csv" | "/data/703_trust_in_government.csv" | "/data/704_institutional_trust_full.csv" | "/data/706_tax_pairwise_comparisons.csv" | "/data/707_middle_class_right_track_predictors.csv" | "/data/801_self_poor_regression_results.csv" | "/data/802_life_satisfaction_regression_results.csv" | "/data/803_all_regression_results_combined.csv" | "/data/804_regression_variable_metadata.csv" | "/data/README.md" | "/images/logo.png" | string & {};
	}
}