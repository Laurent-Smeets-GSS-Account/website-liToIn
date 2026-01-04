<script lang="ts">
	import { login } from '$lib/stores/auth';
	
	let password = '';
	let error = false;
	let loading = false;
	
	function handleSubmit() {
		loading = true;
		error = false;
		
		// Small delay for UX
		setTimeout(() => {
			const success = login(password);
			if (!success) {
				error = true;
				password = '';
			}
			loading = false;
		}, 300);
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="login-overlay">
	<div class="login-card">
		<div class="login-header">
			<div class="logo-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2L2 7l10 5 10-5-10-5z"/>
					<path d="M2 17l10 5 10-5"/>
					<path d="M2 12l10 5 10-5"/>
				</svg>
			</div>
			<h1>Listening to Indonesia</h1>
			<p>This site is password protected</p>
		</div>
		
		<div class="login-form">
			<div class="input-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					on:keydown={handleKeydown}
					placeholder="Enter password"
					class:error
					disabled={loading}
					autocomplete="current-password"
				/>
				{#if error}
					<span class="error-message">Incorrect password</span>
				{/if}
			</div>
			
			<button 
				class="login-btn" 
				on:click={handleSubmit}
				disabled={loading || !password}
			>
				{#if loading}
					<span class="spinner"></span>
					Checking...
				{:else}
					Enter Site
				{/if}
			</button>
		</div>
		
		<p class="hint">Contact the site administrator for access</p>
	</div>
</div>

<style>
	.login-overlay {
		position: fixed;
		inset: 0;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99999;
		padding: 1rem;
	}
	
	.login-card {
		background: white;
		border-radius: 1rem;
		padding: 2.5rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
	}
	
	.login-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.logo-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 1rem;
		color: #C41E3A;
	}
	
	.logo-icon svg {
		width: 100%;
		height: 100%;
	}
	
	.login-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}
	
	.login-header p {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}
	
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.input-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
	
	.input-group input {
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.15s ease;
	}
	
	.input-group input:focus {
		outline: none;
		border-color: #C41E3A;
		box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
	}
	
	.input-group input.error {
		border-color: #ef4444;
		background: #fef2f2;
	}
	
	.input-group input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}
	
	.error-message {
		color: #ef4444;
		font-size: 0.8125rem;
	}
	
	.login-btn {
		padding: 0.75rem 1.5rem;
		background: #C41E3A;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	
	.login-btn:hover:not(:disabled) {
		background: #a31830;
	}
	
	.login-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}
	
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.hint {
		text-align: center;
		color: #9ca3af;
		font-size: 0.75rem;
		margin: 1.5rem 0 0 0;
	}
</style>
