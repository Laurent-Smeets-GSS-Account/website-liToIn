# Listening to Indonesia - Complete Setup Tutorial

A modern, responsive data visualization dashboard built with **SvelteKit**, **Tailwind CSS**, and interactive charts.

---

## 📋 Requirements Checklist

✅ Super modern SvelteKit-based website  
✅ Desktop and mobile friendly (responsive)  
✅ Hosted on GitHub Pages  
✅ Interactive charts with clickable legend filters  
✅ Download charts as PNG  
✅ Download data as CSV  
✅ Text editable via Markdown files  
✅ Values/colors/config in JSON files  
✅ Easy to add new pages  
✅ Topic boxes link to pages  
✅ All 6 placeholder pages included  

---

## 🛠️ Prerequisites

Before starting, install these tools:

### 1. Node.js (version 18 or higher)

Download from: https://nodejs.org/

Verify installation:
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

### 2. Git

Download from: https://git-scm.com/

Verify installation:
```bash
git --version
```

### 3. VS Code (Recommended)

Download from: https://code.visualstudio.com/

**Recommended Extensions:**
- Svelte for VS Code
- Tailwind CSS IntelliSense
- Prettier - Code formatter

---

## 🚀 Quick Start

### Step 1: Extract and Open Project

```bash
# Unzip the project
unzip listening-to-indonesia.zip

# Open in VS Code
cd listening-to-indonesia
code .
```

### Step 2: Install Dependencies

Open VS Code's integrated terminal (Ctrl+` or Cmd+`) and run:

```bash
npm install
```

This will install:
- SvelteKit (framework)
- Tailwind CSS (styling)
- html-to-image (PNG export)
- PapaParse (CSV parsing)
- Marked (Markdown parsing)

### Step 3: Add Your Files

**Add your logo:**
```
Copy your logo.png to:
static/images/logo.png
```

**Add your CSV data files:**
```
Copy your CSV files to:
static/data/
```

Example CSV format for the poverty chart:
```csv
month,poverty_rate
2024-03,28.5
2024-04,27.8
2024-05,26.9
```

### Step 4: Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

**You should see:**
- Hero section with title and stats
- Interactive chart with your data
- 6 clickable topic cards
- Responsive navigation

---

## 📁 Project Structure

```
listening-to-indonesia/
├── src/
│   ├── routes/                    # Pages (file-based routing)
│   │   ├── +layout.svelte         # Global layout
│   │   ├── +page.svelte           # Homepage
│   │   ├── economic-livelihood/   # Topic page
│   │   ├── services-access/
│   │   ├── vulnerability/
│   │   ├── food-insecurity/
│   │   ├── public-opinion/
│   │   └── other-indicators/
│   ├── lib/
│   │   ├── components/            # Reusable components
│   │   │   ├── InteractiveChart   # Charts with download
│   │   │   ├── TopicCard          # Clickable topic boxes
│   │   │   └── ...
│   │   └── utils/                 # Data loading utilities
│   ├── app.css                    # Global styles
│   └── app.html                   # HTML template
├── static/
│   ├── content/                   # ✏️ EDITABLE CONTENT
│   │   ├── site.json              # Site config, colors, stats
│   │   ├── topics.json            # Topic cards config
│   │   ├── home.md                # Homepage markdown
│   │   └── pages/                 # Page-specific markdown
│   │       ├── economic-livelihood.md
│   │       ├── services-access.md
│   │       └── ...
│   ├── data/                      # 📊 YOUR CSV FILES
│   │   └── 502_self_reported_poverty_time_series.csv
│   └── images/                    # 🖼️ LOGO AND IMAGES
│       └── logo.png
├── package.json
├── tailwind.config.js
└── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages
```

---

## ✏️ Customization Guide

### Change Site Title, Subtitle, and Colors

Edit `static/content/site.json`:

```json
{
  "title": "Listening to Indonesia",
  "subtitle": "Your Custom Subtitle Here",
  "description": "Description for SEO...",
  
  "colors": {
    "primary": "#C41E3A",    // Main brand color
    "secondary": "#1E3A5F",  // Secondary color
    "accent": "#D4AF37",     // Accent/highlight
    "background": "#FAFAFA", // Page background
    "surface": "#FFFFFF",    // Card background
    "muted": "#6B7280"       // Muted text
  }
}
```

### Change Stats Cards

In `static/content/site.json`, edit the `stats` array:

```json
"stats": [
  {
    "label": "Households",
    "value": "3,600",
    "icon": "home",
    "subtitle": "surveyed regularly"
  },
  // Add more stats...
]
```

**Available Icons:**
`chart-bar`, `users`, `globe`, `phone`, `shield`, `heart`, `home`, `scale`, `lightning`, `document`, `calendar`, `clock`, `location`

### Configure the Homepage Chart

In `static/content/site.json`, edit `latestChart`:

```json
"latestChart": {
  "title": "Self-Reported Poverty Over Time",
  "dataFile": "502_self_reported_poverty_time_series.csv",
  "xKey": "month",
  "yKeys": ["poverty_rate"],
  "labels": {
    "poverty_rate": "Poverty Rate (%)"
  },
  "xLabel": "Month",
  "yLabel": "Percentage (%)"
}
```

**For multiple series:**
```json
"yKeys": ["poverty_rate", "unemployment_rate"],
"labels": {
  "poverty_rate": "Poverty",
  "unemployment_rate": "Unemployment"
}
```

### Edit Topic Cards

Edit `static/content/topics.json`:

```json
{
  "topics": [
    {
      "id": "economic-livelihood",
      "title": "Monitor Economic Livelihood",
      "icon": "chart-bar",
      "color": "#C41E3A",
      "link": "/economic-livelihood",
      "description": "Track income and employment...",
      "items": [
        "Self-reported poverty rates",
        "Employment status changes"
      ]
    }
  ]
}
```

### Edit Page Content (Markdown)

Each page loads its content from a markdown file. Edit files in `static/content/pages/`:

**Example: `static/content/pages/economic-livelihood.md`**
```markdown
---
title: Monitor Economic Livelihood
subtitle: Track income, employment, and poverty indicators
color: "#C41E3A"
---

# Economic Livelihood Analysis

Your markdown content here...

## Key Findings

- Finding 1
- Finding 2

**Bold text** and *italic text* work!
```

The frontmatter (between `---`) sets the page title, subtitle, and color bar.

### Edit Homepage Description (Markdown)

Edit `static/content/home.md` for the description section on the homepage.

---

## 📊 Working with Charts

### Chart Features

The `InteractiveChart` component includes:
- **Clickable legends** - Click to show/hide data series
- **Download PNG** - Export chart as image
- **Download CSV** - Download the underlying data
- **Tooltips** - Hover for data point details
- **Responsive** - Adapts to screen size

### Adding Charts to Pages

In any page component:

```svelte
<script>
  import { InteractiveChart } from '$lib/components';
  import { loadCSV } from '$lib/utils';
  import { onMount } from 'svelte';
  
  let data = [];
  
  onMount(async () => {
    data = await loadCSV('your_data_file.csv');
  });
</script>

<InteractiveChart
  {data}
  title="Chart Title"
  xKey="date_column"
  yKeys={["value1", "value2"]}
  labels={{ value1: "Label 1", value2: "Label 2" }}
  colors={["#C41E3A", "#1E3A5F"]}
  chartId="unique-chart-id"
  yFormat={(v) => `${v.toFixed(1)}%`}
/>
```

### CSV Data Format

Your CSV files should have:
- Header row with column names
- One column for X-axis (e.g., `month`, `date`)
- One or more columns for Y-axis values

Example:
```csv
month,poverty_rate,food_insecurity
2024-03,28.5,15.2
2024-04,27.8,14.8
```

---

## ➕ Adding New Pages

### Step 1: Create the Folder and Page File

```bash
mkdir src/routes/my-new-page
```

Create `src/routes/my-new-page/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { PageLayout, MarkdownContent } from '$lib/components';
  import { parseMarkdownWithFrontmatter, loadMarkdown } from '$lib/utils';
  
  let frontmatter = {
    title: 'My New Page',
    subtitle: 'Page description',
    color: '#C41E3A'
  };
  
  onMount(async () => {
    const markdown = await loadMarkdown('pages/my-new-page.md');
    const parsed = parseMarkdownWithFrontmatter(markdown);
    if (parsed.frontmatter.title) {
      frontmatter = { ...frontmatter, ...parsed.frontmatter };
    }
  });
</script>

<svelte:head>
  <title>{frontmatter.title} | Listening to Indonesia</title>
</svelte:head>

<PageLayout 
  title={frontmatter.title}
  subtitle={frontmatter.subtitle}
  color={frontmatter.color}
>
  <div class="bg-white rounded-2xl p-8 shadow-card">
    <MarkdownContent src="pages/my-new-page.md" />
  </div>
</PageLayout>
```

### Step 2: Create the Markdown Content

Create `static/content/pages/my-new-page.md`:

```markdown
---
title: My New Page
subtitle: Description of this page
color: "#C41E3A"
---

# My New Page Content

Write your content here using Markdown...
```

### Step 3: Add Navigation Link (Optional)

In `static/content/site.json`, add to the `navigation` array:

```json
"navigation": [
  // ... existing links
  { "label": "New Page", "href": "/my-new-page" }
]
```

### Step 4: Add Topic Card (Optional)

In `static/content/topics.json`, add a new topic:

```json
{
  "id": "my-new-page",
  "title": "My New Page",
  "icon": "document",
  "color": "#C41E3A",
  "link": "/my-new-page",
  "description": "Description...",
  "items": ["Item 1", "Item 2"]
}
```

---

## 🚀 Deploying to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `listening-to-indonesia`)
3. Don't initialize with README (we have files already)

### Step 2: Push Your Code

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/listening-to-indonesia.git

# Push
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**

### Step 4: Wait for Deployment

The GitHub Action will automatically:
1. Install dependencies
2. Build the site
3. Deploy to GitHub Pages

Check the **Actions** tab to see progress.

### Step 5: Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/listening-to-indonesia/
```

---

## 🔧 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Styles not loading

Make sure `../app.css` is imported in `+layout.svelte`

### Charts not showing

1. Check browser console for errors
2. Verify CSV file exists in `static/data/`
3. Check column names match `xKey` and `yKeys`

### GitHub Pages 404 errors

1. Verify the workflow ran successfully (check Actions tab)
2. Make sure Pages is set to deploy from GitHub Actions
3. Wait a few minutes for DNS propagation

### PNG download not working

The html-to-image library requires the chart to be fully rendered. If download fails:
1. Wait for chart to fully load
2. Try again
3. Check browser console for errors

---

## 📚 Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## 📝 File Quick Reference

| What to change | File to edit |
|----------------|--------------|
| Site title, colors | `static/content/site.json` |
| Homepage stats | `static/content/site.json` → `stats` |
| Homepage chart | `static/content/site.json` → `latestChart` |
| Topic cards | `static/content/topics.json` |
| Homepage description | `static/content/home.md` |
| Page content | `static/content/pages/*.md` |
| Navigation links | `static/content/site.json` → `navigation` |
| Footer text | `static/content/site.json` → `footer` |
| Logo | `static/images/logo.png` |
| Data files | `static/data/*.csv` |

---

Built with ❤️ for data-driven insights.
