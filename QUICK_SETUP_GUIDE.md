# 🚀 QUICK SETUP GUIDE
## Praise Night 2025 DP Generator

### ⏱️ 5-Minute Setup

---

## 📦 STEP 1: Download All Files

Create this folder structure on your computer:

```
praise-night-dp-generator/
│
├── index.html
├── .gitignore
├── README.md
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── canvas-handler.js
│   └── utils.js
│
└── assets/
    └── images/
        └── frame.png  ← PUT YOUR TEMPLATE HERE
```

---

## 🖼️ STEP 2: Add Your Template

1. Save your event DP frame as `frame.png`
2. Place it in: `assets/images/frame.png`
3. Make sure it's 1080x1080px

**Important**: The filename MUST be exactly `frame.png` (lowercase)

---

## 🌐 STEP 3: Upload to GitHub

### Option A: Using GitHub Website (Easiest)

1. Go to https://github.com/new
2. Create repository named: `praise-night-dp-generator`
3. Make it **Public**
4. Click "uploading an existing file"
5. Drag ALL your folders and files
6. Click "Commit changes"

### Option B: Using Git Commands

```bash
# Navigate to your folder
cd praise-night-dp-generator

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Praise Night 2025 DP Generator"

# Add remote (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/praise-night-dp-generator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔧 STEP 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source":
   - Select branch: **main**
   - Select folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes
7. Your site is live at: `https://yourusername.github.io/praise-night-dp-generator`

---

## ✅ STEP 5: Test It!

1. Open your GitHub Pages URL
2. Upload a test photo
3. Enter a test name
4. Adjust position if needed
5. Download and check the result

---

## 🎯 STEP 6: Fine-Tune Positioning (Optional)

If the photo or name doesn't align perfectly:

1. Open `js/canvas-handler.js`
2. Find the `config` section (around line 15-30)
3. Adjust these values:

```javascript
photo: {
    centerY: this.height * 0.32,   // Move up/down (try 0.30, 0.35, etc.)
    radius: this.width * 0.23      // Change size (try 0.20, 0.25, etc.)
},
name: {
    centerY: this.height * 0.565,  // Move up/down (try 0.55, 0.58, etc.)
}
```

4. Save and push changes:
```bash
git add .
git commit -m "Adjusted positioning"
git push
```

5. Wait 1 minute and refresh your site

---

## 📱 STEP 7: Share!

Share your link:
- `https://yourusername.github.io/praise-night-dp-generator`

Or create a short link using:
- **Bitly**: https://bitly.com
- **TinyURL**: https://tinyurl.com

Example: `bit.ly/praisenightdp`

---

## 🎨 Quick Customization

### Change Colors

Edit `css/style.css`, find:

```css
:root {
    --primary-color: #4169E1;
    --secondary-color: #9370DB;
    --accent-color: #FF1493;
}
```

Change hex codes to your preferred colors.

### Change Event Name

Edit `index.html`, find:

```html
<h2 class="hero-title">Praise Night 2025</h2>
```

Replace with your event name.

---

## 🆘 Common Issues & Fixes

### ❌ Template Not Showing

**Check:**
- [ ] File is named exactly `frame.png`
- [ ] File is in `assets/images/` folder
- [ ] Clear browser cache (Ctrl+Shift+R)

### ❌ Photo Not Fitting Circle

**Fix:** Adjust `centerY` and `radius` in `canvas-handler.js`

### ❌ GitHub Pages Not Working

**Check:**
- [ ] Repository is Public
- [ ] Waited 2-3 minutes after enabling Pages
- [ ] Correct branch selected (main)
- [ ] No typo in the URL

### ❌ Download Not Working

**Check:**
- [ ] Photo is uploaded
- [ ] Using Chrome, Firefox, or Safari (recommended)

---

## 📞 Need Help?

**Email**: matepluxsystems@gmail.com

**Checklist before contacting:**
- [ ] Followed all steps above
- [ ] Checked common issues
- [ ] Cleared browser cache
- [ ] Tried in different browser

---

## 🎉 You're Done!

Your DP Generator is now live and ready to use!

**Next Steps:**
1. Test with different photos
2. Share link with your community
3. Monitor usage
4. Enjoy the event! 🎊

---

**Made by Mateplux Events** ✨

*For Praise Night 2025 - Overflowing Gratitude*