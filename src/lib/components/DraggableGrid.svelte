<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	
	export let columns: number = 2;
	export let gap: number = 24;
	export let storageKey: string = 'dashboard-layout';
	
	let container: HTMLDivElement;
	let items: HTMLElement[] = [];
	let draggedItem: HTMLElement | null = null;
	let placeholder: HTMLElement | null = null;
	let isDragging = false;
	let isResizing = false;
	let resizingItem: HTMLElement | null = null;
	let startX = 0;
	let startY = 0;
	let startWidth = 0;
	let startHeight = 0;
	
	// Layout state
	let layoutOrder: string[] = [];
	let cardSizes: Record<string, { cols: number; rows: number }> = {};
	
	// Load saved layout from localStorage
	function loadLayout() {
		if (typeof window === 'undefined') return;
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				const parsed = JSON.parse(saved);
				layoutOrder = parsed.order || [];
				cardSizes = parsed.sizes || {};
			}
		} catch (e) {
			console.warn('Failed to load layout:', e);
		}
	}
	
	// Save layout to localStorage
	function saveLayout() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(storageKey, JSON.stringify({
				order: layoutOrder,
				sizes: cardSizes
			}));
		} catch (e) {
			console.warn('Failed to save layout:', e);
		}
	}
	
	// Reset layout to default
	function resetLayout() {
		localStorage.removeItem(storageKey);
		// Force page reload to reset DOM order
		window.location.reload();
	}
	
	// Get all draggable items
	function getItems() {
		if (!container) return [];
		return Array.from(container.querySelectorAll('.grid-item')) as HTMLElement[];
	}
	
	// Reorder items based on layoutOrder
	function reorderItems() {
		if (!container) return;
		
		items = getItems();
		
		if (layoutOrder.length === 0) {
			// Initialize order from current DOM
			layoutOrder = items.map(item => item.dataset.cardId || '');
		} else {
			// Reorder DOM based on saved order
			const fragment = document.createDocumentFragment();
			layoutOrder.forEach(id => {
				const item = items.find(i => i.dataset.cardId === id);
				if (item) fragment.appendChild(item);
			});
			// Add any new items not in saved order
			items.forEach(item => {
				if (!layoutOrder.includes(item.dataset.cardId || '')) {
					fragment.appendChild(item);
				}
			});
			container.appendChild(fragment);
		}
		
		// Apply saved sizes
		items.forEach(item => {
			const id = item.dataset.cardId || '';
			if (cardSizes[id]) {
				item.style.gridColumn = `span ${cardSizes[id].cols}`;
				if (cardSizes[id].rows > 1) {
					item.style.gridRow = `span ${cardSizes[id].rows}`;
				}
			}
		});
	}
	
	// Create placeholder element
	function createPlaceholder(item: HTMLElement) {
		const ph = document.createElement('div');
		ph.className = 'grid-placeholder';
		ph.style.gridColumn = item.style.gridColumn || 'span 1';
		ph.style.gridRow = item.style.gridRow || 'span 1';
		ph.style.minHeight = `${item.offsetHeight}px`;
		return ph;
	}
	
	// Get grid position from mouse coordinates
	function getGridPosition(x: number, y: number) {
		const items = getItems();
		let closestItem: HTMLElement | null = null;
		let closestDist = Infinity;
		let insertAfter = false;
		
		items.forEach(item => {
			if (item === draggedItem) return;
			
			const rect = item.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const dist = Math.hypot(x - centerX, y - centerY);
			
			if (dist < closestDist) {
				closestDist = dist;
				closestItem = item;
				insertAfter = x > centerX || (Math.abs(x - centerX) < 50 && y > centerY);
			}
		});
		
		return { closestItem, insertAfter };
	}
	
	// Handle drag start
	function handleDragStart(e: MouseEvent | TouchEvent) {
		const target = (e.target as HTMLElement).closest('.drag-handle');
		if (!target) return;
		
		const item = target.closest('.grid-item') as HTMLElement;
		if (!item) return;
		
		e.preventDefault();
		isDragging = true;
		draggedItem = item;
		
		// Create placeholder
		placeholder = createPlaceholder(item);
		item.parentNode?.insertBefore(placeholder, item);
		
		// Style dragged item
		const rect = item.getBoundingClientRect();
		item.classList.add('dragging');
		item.style.width = `${rect.width}px`;
		item.style.height = `${rect.height}px`;
		item.style.left = `${rect.left}px`;
		item.style.top = `${rect.top}px`;
		
		const point = 'touches' in e ? e.touches[0] : e;
		startX = point.clientX - rect.left;
		startY = point.clientY - rect.top;
	}
	
	// Handle drag move
	function handleDragMove(e: MouseEvent | TouchEvent) {
		if (!isDragging || !draggedItem || !placeholder) return;
		
		e.preventDefault();
		const point = 'touches' in e ? e.touches[0] : e;
		
		// Move dragged item
		draggedItem.style.left = `${point.clientX - startX}px`;
		draggedItem.style.top = `${point.clientY - startY}px`;
		
		// Find insertion point
		const { closestItem, insertAfter } = getGridPosition(point.clientX, point.clientY);
		
		if (closestItem && closestItem !== placeholder) {
			if (insertAfter) {
				closestItem.parentNode?.insertBefore(placeholder, closestItem.nextSibling);
			} else {
				closestItem.parentNode?.insertBefore(placeholder, closestItem);
			}
		}
	}
	
	// Handle drag end
	function handleDragEnd() {
		if (!isDragging || !draggedItem || !placeholder) return;
		
		isDragging = false;
		
		// Insert dragged item at placeholder position
		placeholder.parentNode?.insertBefore(draggedItem, placeholder);
		placeholder.remove();
		placeholder = null;
		
		// Reset dragged item styles
		draggedItem.classList.remove('dragging');
		draggedItem.style.width = '';
		draggedItem.style.height = '';
		draggedItem.style.left = '';
		draggedItem.style.top = '';
		
		// Update order
		layoutOrder = getItems().map(item => item.dataset.cardId || '');
		saveLayout();
		
		draggedItem = null;
	}
	
	// Handle resize start
	function handleResizeStart(e: MouseEvent | TouchEvent) {
		const target = (e.target as HTMLElement).closest('.resize-handle');
		if (!target) return;
		
		const item = target.closest('.grid-item') as HTMLElement;
		if (!item) return;
		
		e.preventDefault();
		e.stopPropagation();
		isResizing = true;
		resizingItem = item;
		
		const point = 'touches' in e ? e.touches[0] : e;
		startX = point.clientX;
		startY = point.clientY;
		startWidth = item.offsetWidth;
		startHeight = item.offsetHeight;
		
		item.classList.add('resizing');
	}
	
	// Handle resize move
	function handleResizeMove(e: MouseEvent | TouchEvent) {
		if (!isResizing || !resizingItem) return;
		
		e.preventDefault();
		const point = 'touches' in e ? e.touches[0] : e;
		
		const deltaX = point.clientX - startX;
		const deltaY = point.clientY - startY;
		
		// Calculate new column span based on width
		const containerWidth = container.offsetWidth;
		const colWidth = (containerWidth - gap * (columns - 1)) / columns;
		const newWidth = startWidth + deltaX;
		const newCols = Math.max(1, Math.min(columns, Math.round(newWidth / (colWidth + gap))));
		
		// Calculate new row span based on height
		const minHeight = 200;
		const newHeight = Math.max(minHeight, startHeight + deltaY);
		const newRows = Math.max(1, Math.round(newHeight / 300));
		
		resizingItem.style.gridColumn = `span ${newCols}`;
		if (newRows > 1) {
			resizingItem.style.gridRow = `span ${newRows}`;
		} else {
			resizingItem.style.gridRow = '';
		}
	}
	
	// Handle resize end
	function handleResizeEnd() {
		if (!isResizing || !resizingItem) return;
		
		isResizing = false;
		resizingItem.classList.remove('resizing');
		
		// Save size
		const id = resizingItem.dataset.cardId || '';
		const cols = parseInt(resizingItem.style.gridColumn.replace('span ', '')) || 1;
		const rows = parseInt(resizingItem.style.gridRow?.replace('span ', '') || '1') || 1;
		
		cardSizes[id] = { cols, rows };
		saveLayout();
		
		resizingItem = null;
	}
	
	// Toggle card size between half and full width
	function toggleCardSize(item: HTMLElement) {
		const id = item.dataset.cardId || '';
		const currentCols = cardSizes[id]?.cols || 1;
		const newCols = currentCols >= columns ? 1 : columns;
		
		cardSizes[id] = { cols: newCols, rows: cardSizes[id]?.rows || 1 };
		item.style.gridColumn = `span ${newCols}`;
		saveLayout();
	}
	
	onMount(() => {
		loadLayout();
		
		// Wait for children to render
		setTimeout(() => {
			reorderItems();
		}, 100);
		
		// Global event listeners
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchmove', handleDragMove, { passive: false });
		document.addEventListener('touchend', handleDragEnd);
		
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		document.addEventListener('touchmove', handleResizeMove, { passive: false });
		document.addEventListener('touchend', handleResizeEnd);
	});
	
	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('mousemove', handleDragMove);
			document.removeEventListener('mouseup', handleDragEnd);
			document.removeEventListener('touchmove', handleDragMove);
			document.removeEventListener('touchend', handleDragEnd);
			
			document.removeEventListener('mousemove', handleResizeMove);
			document.removeEventListener('mouseup', handleResizeEnd);
			document.removeEventListener('touchmove', handleResizeMove);
			document.removeEventListener('touchend', handleResizeEnd);
		}
	});
</script>

<div class="grid-controls">
	<button class="reset-btn" on:click={resetLayout} title="Reset layout to default">
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
		</svg>
		<span>Reset Layout</span>
	</button>
	<span class="hint">Drag cards by the handle · Resize from corner · Double-click handle to toggle size</span>
</div>

<div 
	bind:this={container} 
	class="draggable-grid"
	style="--columns: {columns}; --gap: {gap}px;"
	on:mousedown={handleDragStart}
	on:touchstart={handleDragStart}
	on:mousedown={handleResizeStart}
	on:touchstart={handleResizeStart}
>
	<slot />
</div>

<style>
	.grid-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}
	
	.reset-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.reset-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
	
	.hint {
		font-size: 0.75rem;
		color: #9ca3af;
	}
	
	.draggable-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		gap: var(--gap);
	}
	
	@media (max-width: 1024px) {
		.draggable-grid {
			grid-template-columns: 1fr;
		}
		
		.grid-controls {
			flex-direction: column;
			gap: 0.5rem;
			text-align: center;
		}
	}
	
	:global(.grid-item) {
		position: relative;
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04);
		border: 1px solid rgba(0,0,0,0.06);
		transition: box-shadow 0.2s, transform 0.2s;
	}
	
	:global(.grid-item:hover) {
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}
	
	:global(.grid-item.dragging) {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
		box-shadow: 0 20px 40px rgba(0,0,0,0.2);
		transform: rotate(2deg) scale(1.02);
		opacity: 0.95;
	}
	
	:global(.grid-item.resizing) {
		z-index: 100;
		box-shadow: 0 8px 24px rgba(0,0,0,0.15);
	}
	
	:global(.grid-placeholder) {
		background: #e0f2fe;
		border: 2px dashed #38bdf8;
		border-radius: 1rem;
		min-height: 200px;
	}
	
	:global(.drag-handle) {
		position: absolute;
		top: 0.75rem;
		right: 2.5rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 0.375rem;
		cursor: grab;
		opacity: 0;
		transition: opacity 0.2s, background 0.15s;
		z-index: 10;
	}
	
	:global(.grid-item:hover .drag-handle) {
		opacity: 1;
	}
	
	:global(.drag-handle:hover) {
		background: #e5e7eb;
	}
	
	:global(.drag-handle:active) {
		cursor: grabbing;
		background: #d1d5db;
	}
	
	:global(.drag-handle svg) {
		width: 16px;
		height: 16px;
		color: #6b7280;
	}
	
	:global(.resize-handle) {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 1.5rem;
		height: 1.5rem;
		cursor: nwse-resize;
		opacity: 0;
		transition: opacity 0.2s;
		z-index: 10;
	}
	
	:global(.grid-item:hover .resize-handle) {
		opacity: 1;
	}
	
	:global(.resize-handle::before) {
		content: '';
		position: absolute;
		bottom: 4px;
		right: 4px;
		width: 12px;
		height: 12px;
		border-right: 2px solid #9ca3af;
		border-bottom: 2px solid #9ca3af;
		border-radius: 0 0 4px 0;
	}
	
	:global(.resize-handle:hover::before) {
		border-color: #6b7280;
	}
	
	/* Card size variations */
	:global(.grid-item[data-size="full"]) {
		grid-column: span 2;
	}
	
	:global(.grid-item[data-size="half"]) {
		grid-column: span 1;
	}
	
	@media (max-width: 1024px) {
		:global(.grid-item),
		:global(.grid-item[data-size="full"]),
		:global(.grid-item[data-size="half"]) {
			grid-column: span 1 !important;
		}
		
		:global(.drag-handle),
		:global(.resize-handle) {
			display: none;
		}
	}
</style>
