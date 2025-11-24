# 🎉 Praise Night 2025 - DP Generator

**Professional Display Picture Generator by Mateplux Events**

Create personalized display pictures for Praise Night 2025 - Overflowing Gratitude event.

---

## 🚀 Live Demo

Visit: `https://yourusername.github.io/praise-night-dp-generator`

---

## ✨ Features

- **Easy Photo Upload**: Drag & drop or click to upload
- **Name Customization**: Add your name in bold, stylish text
- **Advanced Controls**: Zoom and position adjustments
- **High Quality Output**: 1080x1080px PNG download
- **Mobile Responsive**: Works perfectly on all devices
- **Real-time Preview**: See changes instantly
- **Auto-save State**: Your progress is saved automatically
- **Keyboard Shortcuts**: Fast workflow with hotkeys

---

## 📁 Project Structure

```
praise-night-dp-generator/
│
├── index.html                 # Main HTML file
│
├── css/
│   ├── style.css             # Main stylesheet
│   └── responsive.css        # Mobile responsive styles
│
├── js/
│   ├── app.js                # Main application logic
│   ├── canvas-handler.js     # Canvas drawing operations
│   └── utils.js              # Utility functions
│
├── assets/
│   └── images/
│       ├── frame.png         # Event frame template (YOUR TEMPLATE)
│       ├── logo.png          # Mateplux logo (optional)
│       └── favicon.png       # Favicon (optional)
│
└── README.md                  # This file
```

---

## 🛠️ Setup Instructions

### Step 1: Prepare Your Template

1. Save your event frame template as `frame.png`
2. Ensure it's 1080x1080px for best quality
3. The template should have:
   - A circular area for the user's photo
   - A rectangular area for the user's name

### Step 2: GitHub Repository Setup

1. **Create a new repository** on GitHub:
   - Go to https://github.com/new
   - Repository name: `praise-night-dp-generator` (or your choice)
   - Set to **Public**
   - Click "Create repository"

2. **Upload files**:
   ```
   Option A: Using GitHub Web Interface
   - Click "uploading an existing file"
   - Drag all your files
   - Commit changes
   
   Option B: Using Git Command Line
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/praise-night-dp-generator.git
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages

1. Go to your repository **Settings**
2. Scroll to **Pages** section
3. Under "Source", select **main** branch
4. Click **Save**
5. Your site will be live at: `https://yourusername.github.io/praise-night-dp-generator`

### Step 4: Add Your Template

1. Create folder structure:
   ```
   assets/
   └── images/
       └── frame.png  (YOUR TEMPLATE HERE)
   ```

2. Upload your `frame.png` to `assets/images/`

### Step 5: Adjust Template Coordinates (if needed)

If the photo or name doesn't align perfectly, edit `js/canvas-handler.js`:

```javascript
this.config = {
    photo: {
        centerX: this.width / 2,          // X position
        centerY: this.height * 0.32,      // Y position (adjust this)
        radius: this.width * 0.23         // Circle size (adjust this)
    },
    name: {
        centerX: this.width / 2,
        centerY: this.height * 0.565,     // Name Y position (adjust this)
        maxWidth: this.width * 0.4,       // Max text width
        fontSize: {
            min: 30,
            max: 60
        }
    }
};
```

**Tips for finding correct values:**
- `centerY: 0.32` means 32% from the top
- `radius: 0.23` means circle is 23% of canvas width
- Adjust decimal values (e.g., 0.30, 0.35) to move elements

---

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + S**: Download DP
- **Ctrl/Cmd + U**: Upload photo
- **Escape**: Reset adjustments

---

## 📱 Supported Browsers

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

---

## 🎨 Customization

### Change Colors

Edit `css/style.css`:

```css
:root {
    --primary-color: #4169E1;      /* Main blue */
    --secondary-color: #9370DB;    /* Purple */
    --accent-color: #FF1493;       /* Pink */
}
```

### Change Event Details

Edit `index.html` - Update the "About Event" section with your event info.

### Add Logo

1. Add `logo.png` to `assets/images/`
2. Update header in `index.html`

---

## 🔧 Advanced Configuration

### File Size Limits

Edit `js/utils.js`:

```javascript
const FileValidator = {
    maxSize: 5 * 1024 * 1024, // Change this (in bytes)
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};
```

### Character Limit for Names

Edit `index.html`:

```html
<input type="text" id="nameInput" maxlength="25">
```

---

## 📊 Analytics Integration

To track usage, add Google Analytics in `index.html`:

```html
<head>
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    </script>
</head>
```

---

## 🐛 Troubleshooting

### Template Not Loading

**Problem**: Frame doesn't appear  
**Solution**: 
1. Check `assets/images/frame.png` exists
2. Verify filename is exactly `frame.png` (case-sensitive)
3. Clear browser cache (Ctrl + Shift + R)

### Photo Not Fitting

**Problem**: User photo is cropped wrong  
**Solution**: Adjust coordinates in `js/canvas-handler.js` (see Step 5 above)

### Name Not Showing

**Problem**: Name text not visible  
**Solution**: Check `centerY` value in `canvas-handler.js` config

### Download Not Working

**Problem**: Download button disabled  
**Solution**: Ensure user has uploaded a photo first

---

## 📞 Support

- **Creator**: Mateplux Media Systems Ltd.
- **Email**: matepluxsystems@gmail.com
- **Event**: Praise Night 2025 - CGMi Praise Centre

---

## 📝 License

© 2025 Mateplux Events. All rights reserved.

This project is created for Church of God Mission International Inc. - New Warri Bishopric, Praise Centre.

---

## 🙏 Credits

- **Event Manager**: Anthony Obruche
- **Creative Director**: Mateplux Media Systems Ltd.
- **Host Pastors**: Bishop Asuquo Akpan-Ekpo & Rev. Mrs. Akpan-Ekpo

---

## 🎯 Event Information

**PRAISE NIGHT 2025 - OVERFLOWING GRATITUDE**

A Prelude to the End-of-Year Thanksgiving

- **Date**: 5th December 2025
- **Time**: 8:00 PM - 4:45 AM
- **Venue**: CGMi Praise Centre, New Warri Bishopric

**Hashtags**: #PraiseNight2025 #OverflowingGratitude

---

## 🚀 Future Enhancements

Planned features:
- [ ] Multiple frame templates
- [ ] Color filters
- [ ] Stickers and decorations
- [ ] Batch processing
- [ ] Social media direct sharing
- [ ] QR code generation

---

## 📋 Changelog

### Version 1.0.0 (2025-01-XX)
- Initial release
- Photo upload with drag & drop
- Name customization
- Zoom and position controls
- High-quality PNG download
- Mobile responsive design
- Auto-save functionality

---

**Made with ❤️ by Mateplux Events**

*Transforming Events into Unforgettable Experiences*