# Exported Plot Data and Regression Results

This folder contains CSV files with data extracted from the Indonesia Household Survey analysis.
Each file corresponds to a specific visualization or regression analysis.

## File Naming Convention
- Files are numbered by category (1xx = Infrastructure, 2xx = Food Security, etc.)
- See file descriptions below for details

## File Descriptions

### 101_water_disruption_by_region.csv
- **Description**: Water supply disruption rates by region (last 12 months)
- **Columns**:
  - `region`: Geographic region or 'Indonesia Total'
  - `percentage`: Weighted percentage with disruption
  - `weighted_count`: Population-weighted count
  - `n_households`: Number of households

### 102_water_disruption_by_quintile.csv
- **Description**: Average days of water disruption by wealth quintile
- **Columns**:
  - `quint`: Quintile number (1-5)
  - `avg_days`: Average days of disruption
  - `weighted_n`: Weighted sample size
  - `se`: Standard error
  - `lower_ci`, `upper_ci`: 95% confidence interval
  - `quintile_label`: 'Poorest', '2', '3', '4', 'Richest'

### 103_water_issues_time_series.csv
- **Description**: Monthly trends in water-related issues
- **Columns**:
  - `month`: Month
  - `disruption_pct`: % with disruption
  - `worry_days`: Days worried about water
  - `no_washing_days`: Days without washing
  - `schedule_change_days`: Days schedule changed
  - `no_handwashing_days`: Days without handwashing
  - `not_enough_drinking`: Days not enough to drink
  - `no_water_days`: Days with no water

### 104_alternative_water_sources.csv
- **Description**: Alternative water sources used during disruptions (sh3)
- **Columns**:
  - `date`: Survey date
  - `source_label`: Type of alternative water source
  - `weighted_count`: Weighted count of households
  - `n_households`: Number of households
  - `percentage`: Percentage of households using this source

### 105_electricity_hours_distribution.csv
- **Description**: Weighted percentage distribution of electricity availability hours
- **Columns**:
  - `date`: Survey date
  - `hour`: Hours of electricity availability (0-24)
  - `percentage`: Weighted percentage of households
  - `variable`: 'Yesterday' or 'Day_Before_Yesterday' (sh4 vs sh5)

### 106_electricity_correlation_matrix.csv
- **Description**: Correlation matrix for electricity-related variables
- **Columns**:
  - `variable1`, `variable2`: Variable names
  - `correlation`: Pearson correlation coefficient
- **Variables**:
  - avg_sh4: Hours of electricity yesterday
  - avg_sh7: Days last payment covered
  - avg_vw1: Tariff too high perception
  - avg_vw31: Support tariff increase for quality
  - avg_vw35: Service quality problem
  - avg_vw_sub1: Subsidies appropriately targeted

### 201_food_insecurity_by_time_region.csv
- **Description**: FIES indicators by month and region
- **Columns**:
  - `mofd_label`: Month (YYYYMM format)
  - `region`: Geographic region
  - `worried`: Worried about not having enough food
  - `unhealthy`: Unable to eat healthy/nutritious food
  - `low_diversity`: Ate only a few kinds of foods
  - `skip_meal`: Had to skip a meal
  - `eat_less`: Ate less than needed
  - `ran_out`: Ran out of food
  - `went_hungry`: Felt hungry but did not eat
  - `whole_day`: Went without eating for a whole day

### 202_food_insecurity_score_distribution.csv
- **Description**: Distribution of food insecurity scores over time
- **Columns**:
  - `mofd_label`: Month
  - `totfoodinsec`: Food insecurity score (0-8)
  - `weighted_count`: Weighted count
  - `percentage`: Percentage of population

### 203_food_insecurity_score_by_region.csv
- **Description**: Distribution of food insecurity scores by region over time
- **Columns**:
  - `mofd_label`: Month
  - `region`: Geographic region
  - `totfoodinsec`: Food insecurity score (0-8)
  - `weighted_count`: Weighted count
  - `percentage`: Percentage within region-month

### 204_fies_measures_by_quintile.csv
- **Description**: FIES indicator means by wealth quintile
- **Columns**:
  - `quint`: Quintile (1-5)
  - `worried`, `unhealthy`, `low_diversity`, `skip_meal`: FIES indicators (proportions)
  - `eat_less`, `ran_out`, `went_hungry`, `whole_day`: FIES indicators (proportions)
  - `quintile_label`: Quintile label

### 205_fies_transitions_within_households.csv
- **Description**: Month-to-month FIES transitions within households
- **Columns**:
  - `date`: Survey date
  - `source_state`: Previous month state (e.g., 'worried' or 'Not_worried')
  - `dest_state`: Current month state
  - `weighted_count`: Weighted count of transitions
  - `n_households`: Number of households
  - `percentage`: Percentage of transitions
  - `indicator`: FIES indicator name

### 206_regional_fies_radar_latest.csv
- **Description**: Regional FIES comparison for radar chart (latest month)
- **Columns**:
  - `region`: Geographic region or 'Indonesia'
  - `worried`, `unhealthy`, `low_diversity`, `skip_meal`: FIES indicators (%)
  - `eat_less`, `ran_out`, `went_hungry`, `whole_day`: FIES indicators (%)
  - `date`: Latest survey date

### 207_fies_risk_in_high_cost_areas.csv
- **Description**: Logistic regression: food insecurity risk vs local cost of living
- **Columns**:
  - `indicator`: FIES indicator name
  - `odds_ratio`: Odds ratio for pdef3 (cost of living)
  - `pct_increase`: Percentage increase in risk per unit pdef3
  - `coefficient`: Log odds coefficient
  - `std_error`: Standard error
  - `n_obs`: Number of observations
  - `indicator_label`: Human-readable label
- **Note**: Controls for log per-capita deflated income

### 301_food_prices_quantities_by_quintile.csv
- **Description**: Price and quantity data for rice, chicken, eggs by quintile
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile (1-5)
  - `mean_kg`: Average quantity purchased (kg)
  - `mean_price`: Average price per kg
  - `product`: 'rice', 'chicken', or 'eggs'
  - `quintile_label`: Quintile label

### 302_food_prices_by_region.csv
- **Description**: Price and quantity data for rice, chicken, eggs by region
- **Columns**:
  - `date`: Survey date
  - `region`: Geographic region
  - `mean_kg`: Average quantity purchased (kg)
  - `mean_price`: Average price per kg
  - `product`: 'rice', 'chicken', or 'eggs'

### 303_sembako_price_perception.csv
- **Description**: % agreeing sembako prices rose too fast (vw5=1) by quintile
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile (1-5)
  - `vw5`: Response code (1 = prices rose too fast)
  - `n`: Weighted count
  - `percent`: Percentage agreeing prices rose too fast
  - `quintile_label`: Quintile label

### 304_inflation_perception.csv
- **Description**: Subjective inflation perception by quintile
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile
  - `sv28`: Inflation perception code
  - `n`: Weighted count
  - `percent`: Percentage within quintile-date group
  - `quintile_label`, `inflation_perception`: Labels

### 401_savings_by_method_quintile.csv
- **Description**: Savings methods by wealth quintile (last 12 months)
- **Columns**:
  - `quint`: Quintile (1-5)
  - `saving_method`: Bank, Ewallet, Cash, Group, Other
  - `percentage`: % using this method
  - `quintile_label`: Quintile label

### 402_mean_monthly_savings_by_quintile.csv
- **Description**: Mean monthly savings (nominal and real) by quintile over time
- **Columns**:
  - `quint`: Quintile (1-5)
  - `date`: Survey date
  - `mean_nom_save`: Mean nominal monthly savings
  - `mean_real_save`: Mean real monthly savings (inflation-adjusted)
  - `n_obs`: Number of observations
  - `quintile_label`: Quintile label

### 403_credit_uptake_by_class.csv
- **Description**: New credit uptake by self-reported economic class over time
- **Columns**:
  - `class_label`: Self-reported class (Poor/Lower middle class/Upper middle class)
  - `date`: Survey date
  - `percentage`: % of households taking new credit
  - `n_obs`: Number of observations

### 404_emergency_expense_capability.csv
- **Description**: Ability to pay 300,000 Rupiah emergency expense
- **Columns**:
  - `quint`: Quintile
  - `date`: Survey date
  - `percentage`: % who could pay
  - `quintile_label`: Quintile label

### 405_financial_indicators_by_quintile.csv
- **Description**: Financial behavior indicators by quintile over time
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile (1-5)
  - `variable`: Variable code (sv1, sv2, sv7, sv9, sv12, sv19, sv44, wb6, sv40, sv41, sv42)
  - `response`: Response (Yes/Agree)
  - `n`: Weighted count
  - `percent`: Percentage with this response
  - `quintile_label`: Quintile label
  - `variable_label`: Human-readable variable description

### 406_financial_behaviors_by_business_income.csv
- **Description**: Financial behaviors by business/self-employment income status
- **Columns**:
  - `date`: Survey date
  - `business_income`: 'Has Business Income' or 'No Business Income'
  - `variable`: Variable code (sv1, sv2, sv9, sv12, sv19, sv3)
  - `response`: Response (Yes)
  - `n`: Weighted count
  - `percent`: Percentage with Yes response
  - `variable_label`: Human-readable variable description

### 407_borrowing_saving_time_series.csv
- **Description**: Borrowing and saving behavior over time by quintile
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile
  - `pct_borrowed`: % who borrowed
  - `pct_used_savings`: % who used savings for basic needs
  - `pct_sold_assets`: % who sold assets
  - `pct_able_to_save`: % able to save
  - `quintile_label`: Quintile label

### 501_economic_class_distribution.csv
- **Description**: Self-reported economic class distribution over time
- **Columns**:
  - `date`: Survey date
  - `wb32`: Economic class code (1-5)
  - `n`: Weighted count
  - `percentage`: Percentage
  - `class_label`: Class description

### 502_self_reported_poverty_time_series.csv
- **Description**: Self-reported poverty rate over time (from vw23)
- **Columns**:
  - `date`: Survey date
  - `self_poor_rate`: Proportion identifying as poor (0-1)
  - `percentage`: Percentage identifying as poor (0-100)
  - `n_obs`: Number of observations

### 503_economic_mobility_sankey.csv
- **Description**: Economic mobility flows for Sankey diagram (wb32->wb33)
- **Note**: Uses only the most recent survey month
- **Columns**:
  - `wb32`: Current economic class (1-5)
  - `wb33`: Expected future class in 5 years (1-5)
  - `n`: Weighted count
  - `percentage`: Percentage of total flows
  - `current_class`: Current class label
  - `future_class`: Future class label
  - `direction`: Flow direction (improvement/decline/stable)

### 504_economic_outlook_by_quintile.csv
- **Description**: Economic outlook (current vs 5-year expectation) by quintile and total
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile (1-5, NA for Total)
  - `total_population`: Total weighted population
  - `pct_improving`: % expecting improvement
  - `pct_declining`: % expecting decline
  - `pct_stable`: % expecting no change
  - `quintile_label`: Quintile label (Poorest/2/3/4/Richest/Total)

### 505_coping_strategies_time_series.csv
- **Description**: Coping strategies used by households over time
- **Columns**:
  - `date`: Survey date
  - `forgo_health_pct`: % forgoing healthcare
  - `unab_pay_util_pct`: % unable to pay utilities
  - `sell_asset_pct`: % selling assets
  - `dissave_pct`: % taking from savings for basic needs

### 506_median_income_by_class.csv
- **Description**: Median per capita real income by self-reported economic class (quarterly)
- **Columns**:
  - `clean_class_label`: Self-reported class (Poor/Lower middle class/Upper middle class)
  - `quarter`: Quarter start date
  - `median_pc_inc_real`: Weighted median per capita real income
  - `n_obs`: Number of observations
  - `weighted_n`: Weighted population count

### 507_individual_characteristics_by_class.csv
- **Description**: Individual characteristics by self-reported economic class over time
- **Columns**:
  - `clean_class_label`: Self-reported class
  - `date`: Survey date
  - `pct_looking_work`: % looking for work
  - `pct_part_time`: % working part time
  - `pct_disability`: % with disability
  - `n_obs`: Number of observations

### 601_fraud_rates_by_quintile.csv
- **Description**: Fraud experience rates by wealth quintile
- **Columns**:
  - `quint`: Quintile (1-5)
  - `fraud_rate`: Proportion experiencing fraud
  - `fraud_with_loss_rate`: Proportion experiencing fraud with financial loss
  - `n_obs`: Number of observations
  - `quintile_label`: Quintile label

### 602_fraud_loss_amounts_over_time.csv
- **Description**: Fraud loss amounts distribution over time
- **Columns**:
  - `date`: Survey date
  - `loss_grp`: Loss amount category
  - `weighted_count`: Weighted count
  - `n_obs`: Number of observations
  - `percentage`: Percentage within date

### 603_trust_in_banking_institutions.csv
- **Description**: Trust perceptions for traditional banks vs mobile money
- **Columns**:
  - `date`: Survey date
  - `trust_category`: Very safe/Somewhat safe/Somewhat unsafe/Very unsafe
  - `weighted_count`: Weighted count
  - `percentage`: Percentage within date-account_type group
  - `account_type`: 'Traditional Bank' or 'Mobile Money'

### 604_fraud_reporting_channels.csv
- **Description**: Where fraud is reported (among fraud victims)
- **Columns**:
  - `date`: Survey date
  - `bank_pct`: % reported to bank
  - `police_pct`: % reported to police
  - `local_gov_pct`: % reported to local government
  - `helpline_pct`: % reported to BI/Regulator/Helpline
  - `not_reported_pct`: % not reported
  - `n_fraud_victims`: Number of fraud victims

### 701_economic_conditions_perception.csv
- **Description**: Neighborhood economic conditions perception over time
- **Columns**:
  - `date`: Survey date
  - `wb14_label`: Economic condition rating (Very good/Good/Bad/Very bad)
  - `weighted_sum`: Weighted count
  - `proportion`: Proportion of respondents

### 702_economic_conditions_by_quintile.csv
- **Description**: % believing economic conditions are good, by quintile
- **Columns**:
  - `date`: Survey date
  - `quint`: Quintile (1-5)
  - `econ_good`: TRUE (good/very good conditions)
  - `weighted_sum`: Weighted count
  - `proportion`: Proportion believing conditions are good
  - `quintile_label`: Quintile label

### 703_trust_in_government.csv
- **Description**: Trust in government institutions over time
- **Columns**:
  - `date`: Survey date
  - `trust_variable`: Variable name
  - `mean_trust`: Average trust level
  - `n`: Sample size
  - `trust_label`: Institution name

### 704_institutional_trust_full.csv
- **Description**: Full institutional trust data (all institutions, all categories)
- **Columns**:
  - `category`: 'Inefficient/Incompetent', 'Unequal before the law', 'Do not trust'
  - `institution`: Institution name
  - `no_share`: % with negative perception
  - `n`: Sample size

### 705_tax_preferences_ranking.csv
- **Description**: Tax preference rankings from paired comparisons
- **Columns**:
  - `tax_option`: Tax code (a-m)
  - `total_chosen`: Times chosen
  - `total_appearances`: Total times presented
  - `win_rate`: Percentage of times chosen when presented
  - `tax_name`: Full name of tax type

### 706_tax_pairwise_comparisons.csv
- **Description**: Pairwise tax preference comparisons for heatmap
- **Columns**:
  - `opt1`, `opt2`: Tax option codes
  - `opt1_wins`, `opt2_wins`: Times each option won
  - `total`: Total comparisons
  - `opt1_win_rate`: Win rate for opt1 vs opt2
  - `opt1_name`, `opt2_name`: Tax type names

### 707_middle_class_right_track_predictors.csv
- **Description**: Middle class 'right track' perception by key predictors
- **Columns**:
  - `predictor value`: Value of the predictor (0 or 1)
  - `pct_right_track`: % believing Indonesia is on right track
  - `n`: Sample size
  - `predictor`: Predictor variable name
- **Note**: Shows % believing Indonesia is on right track by predictor status

### 801_self_poor_regression_results.csv
- **Description**: Fixed effects panel regression results for self-reported poverty (vw23)
- **Columns**:
  - `outcome`: 'self_reported_poor'
  - `category`: Variable category (Infrastructure, Financial Hardship, etc.)
  - `predictor`: Variable code
  - `variable_label`: Human-readable variable name
  - `term`: Coefficient term
  - `estimate`: Point estimate (coefficient)
  - `std.error`: Standard error
  - `statistic`: t-statistic
  - `p.value`: p-value
  - `conf.low`, `conf.high`: 95% confidence interval
  - `n_obs`: Number of observations
  - `significance`: Significance stars (*** p<0.001, ** p<0.01, * p<0.05, . p<0.1)

### 802_life_satisfaction_regression_results.csv
- **Description**: Fixed effects panel regression results for life satisfaction (wb3)
- **Columns**: Same as 801

### 803_all_regression_results_combined.csv
- **Description**: Combined results from both regression analyses
- **Columns**: Same as 801

### 804_regression_variable_metadata.csv
- **Description**: Metadata for regression variables
- **Columns**:
  - `predictor`: Variable code
  - `variable_label`: Human-readable variable name
  - `category`: Variable category


## File Numbering System

- **1xx**: Infrastructure Services (Water, Electricity)
- **2xx**: Food Security (FIES indicators)
- **3xx**: Cost of Living (Prices, Inflation)
- **4xx**: Financial Inclusion & Behavior
- **5xx**: Subjective Wellbeing & Economic Outlook
- **6xx**: Fraud & Financial Safety
- **7xx**: Trust, Governance & Policy Preferences
- **8xx**: Regression Results

## Notes

- All percentages use population weights (popw for household data, indw for individual data)
- Quintiles are based on wealth/income (1 = Poorest, 5 = Richest)
- Dates are in ISO format (YYYY-MM-DD) unless otherwise noted
- Regression results include confidence intervals and significance levels
- Missing values (NA) indicate data not available or filtered out

## Data Sources

- Household level data: Anon_HH_L2Indo_Analysisfile.dta
- Individual level data: Anon_IND_L2Indo_Analysisfile.dta

## Generated: 2026-01-04 17:29:25.412518
