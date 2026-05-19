# Nyodera Heights - Luxury Furnished Apartments & Airbnb Services

A modern, responsive website for Nyodera Heights, a premium provider of furnished apartments and Airbnb services. This website showcases properties, facilitates bookings, and provides excellent customer service.

## 🏠 Features

### Pages
- **Home Page** - Hero section with search functionality, featured properties, services overview, about section, and testimonials
- **Listings Page** - Browse all properties with advanced filtering options (price, bedrooms, amenities, location)
- **Property Details** - Comprehensive property information with image gallery, booking form, and amenities list
- **Contact Page** - Contact form, business information, FAQ section, and map integration

### Functionality
- ✨ Modern, responsive design (mobile, tablet, desktop)
- 🔍 Advanced property search and filtering
- 📅 Booking system with date validation
- 📸 Image gallery with thumbnails
- 💬 Contact form with validation
- 📱 Mobile-friendly navigation with hamburger menu
- 🗺️ Google Maps integration
- 📊 Property comparison and filtering
- ♿ Accessible design standards

## 📁 Project Structure

```
/workspaces/NH/
├── index.html              # Homepage
├── listings.html           # Property listings page
├── property-detail.html    # Individual property details
├── contact.html            # Contact and information page
├── styles.css              # Main stylesheet
├── script.js               # JavaScript functionality
├── README.md               # This file
└── LICENSE                 # License information
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Interactive features and validation
- **Responsive Design** - Mobile-first approach
- **Google Maps API** - Location integration

## 🎨 Design Features

### Color Scheme
- Primary Color: `#2c3e50` (Dark Blue)
- Secondary Color: `#e74c3c` (Red)
- Accent Color: `#3498db` (Light Blue)
- Light Background: `#ecf0f1`

### Responsive Breakpoints
- Desktop: 1200px and above
- Tablet: 768px to 1199px
- Mobile: Below 768px
- Small Mobile: Below 480px

## 📖 Usage Instructions

### 1. Opening the Website
Simply open `index.html` in your web browser.

### 2. Navigation
Use the navigation bar at the top to move between pages:
- **Home** - Main homepage
- **Listings** - View all properties
- **About** - Information about Nyodera Heights
- **Contact** - Get in touch

### 3. Searching Properties
On the homepage or listings page:
1. Use the search bar to find properties
2. Apply filters (price, bedrooms, amenities, location)
3. Click on a property card to view details

### 4. Booking a Property
1. Navigate to the property details page
2. Select check-in and check-out dates
3. Specify the number of guests
4. Click "Reserve Now"
5. Confirmation details will be sent to your email

### 5. Contact Form
1. Fill in your name, email, and message
2. Select a subject
3. Optional: Subscribe to newsletter
4. Submit the form
5. You'll receive a confirmation message

## 🔧 Customization

### Update Company Information
Edit the following files to update contact information:
- **Contact info**: Update in footer of all `.html` files
- **Phone/Email**: Update in `contact.html` and footer

### Modify Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #e74c3c;
    --accent-color: #3498db;
    /* ... etc */
}
```

### Add New Properties
Edit the property data in `script.js` `loadPropertyDetails()` function:
```javascript
const properties = {
    1: { /* existing property */ },
    7: { /* new property */ }
};
```

## 📱 Browser Compatibility

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Key Sections

### Navigation Bar
- Fixed at top of page
- Contains logo and navigation links
- Mobile hamburger menu for smaller screens

### Hero Section
- Large banner with call-to-action
- Search bar for quick property lookup
- Eye-catching gradient background

### Featured Properties
- Grid layout showcasing 3 properties
- Price tags, amenities, and call-to-action buttons
- Hover effects for interactivity

### Services Section
- 4 main service cards
- Icons and descriptions
- Hover animations

### About Section
- Company information
- Key statistics
- Company image

### Testimonials
- Customer reviews and ratings
- 5-star rating system
- Professional styling

### Footer
- Quick links
- Contact information
- Social media links
- Copyright information

## 📞 Contact Information

**Nyodera Heights**
- 📍 123 Luxury Avenue, Downtown District
- 📞 (555) 123-4567
- ✉️ info@nyoderaheights.com
- 🕐 24/7 Customer Support

## 📋 Features Overview

### Search & Filtering
- Price range slider
- Bedroom filter
- Location selector
- Amenities checkboxes
- Real-time filter updates

### Property Details
- Multiple image gallery
- Detailed specifications
- Complete amenities list
- Booking calendar
- Location map
- Similar properties

### Mobile Responsiveness
- Hamburger menu
- Stacked layout
- Touch-friendly buttons
- Optimized images
- Fast loading

## 🔒 Security & Validation

- Email validation on contact forms
- Date validation for bookings
- Input sanitization
- Secure form handling

## 🚀 Performance Tips

1. Images use placeholder CDN (replace with actual images)
2. CSS is minified and optimized
3. JavaScript uses event delegation
4. Mobile-first CSS approach
5. Lazy loading ready

## 📈 Future Enhancements

- User accounts and login system
- Advanced booking calendar
- Payment integration
- Review and rating system
- Property management dashboard
- Email confirmation system
- SMS notifications
- Virtual tours
- AI-powered recommendations

## 📄 License

See LICENSE file for details.

## 🤝 Support

For support or inquiries, contact:
- Email: support@nyoderaheights.com
- Phone: (555) 555-5555
- Website: www.nyoderaheights.com

---

**Nyodera Heights** © 2026. All rights reserved.
