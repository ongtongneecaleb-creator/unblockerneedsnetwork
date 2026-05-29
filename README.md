# Link Dispenser - Unblocker Network

A web-based link dispenser application for managing and sharing unblocker links with automatic saving functionality. Supports multiple blocker types and proxy services.

## Features

### For Users
- 🔗 Browse available unblocker links
- 🔍 Filter by blocker type (Lightspeed, Blocksi, Cisco, etc.)
- 🎯 Filter by proxy type (Zinko Space, Infamous, Axiom, etc.)
- 📋 Copy links to clipboard with one click
- 📱 Responsive design for mobile and desktop

### For Administrators
- 🔐 Secure PIN-based login, can be managed by you!
- ➕ Add new unblocker links with blocker/proxy selection
- ❌ Remove links as needed
- 💾 Automatic data persistence using browser localStorage
- 📊 Manage all available links from the admin panel

## Supported Blockers

1. **Lightspeed**
2. **Lightspeed AI**
3. **Blocksi AI**
4. **Blocksi Web**
5. **ContentKeeper**
6. **Cisco**
7. **Deledao**
8. **Fortinet/FortiGuard**
9. **Securely**
10. **Linewize**

## Supported Proxies

1. **Zinko Space**
2. **Infamous**
3. **Axiom**
4. **Alura**
5. **Arctic**
6. **more to list**

## How to Use

### For Regular Users

1. Open `index.html` in your web browser
2. Browse the available links in the main view
3. Use the filters to find links for specific blockers or proxies
4. Click "Copy Link" to copy the URL to your clipboard
5. Paste the link wherever needed

### For Administrators

1. Click the "Admin Login" button
2. Enter the PIN: `788728`
3. In the Admin Panel:
   - **Add New Link**: Fill in the URL, select blocker and proxy types, then click "Add Link"
   - **Manage Links**: View all links with copy and delete options
4. Changes are automatically saved to browser storage
5. Click "Logout" to exit admin mode

## Data Storage

All links are automatically saved to the browser's localStorage under the key `unblockerneedsnetwork_links`. This means:

- ✅ Data persists between browser sessions
- ✅ No server required
- ⚠️ Data is stored locally on each device/browser
- ⚠️ Clearing browser cache will delete the links

## File Structure

```
unblockerneedsnetwork/
├── index.html      # Main HTML structure
├── styles.css      # Styling with dark theme
├── script.js       # Application logic
└── README.md       # This file
```

## Security Notes

- The admin PIN can be changed in `script.js`
- Data is stored locally in the browser (not transmitted to servers)
- For production use, consider implementing:
  - Stronger authentication
  - Backend database storage
  - HTTPS encryption
  - User roles and permissions

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Customization

### Change Admin PIN

Edit `script.js` and find the line:
```javascript
const ADMIN_PIN = '788728';
```
Change to your desired PIN.

### Add New Blocker Types

1. Add option in HTML select (lines 56-67)
2. Add value in `script.js` (getBlockerLabel function)

### Add New Proxy Types

1. Add option in HTML select (lines 68-75)
2. Add value in `script.js` (getProxyLabel function)

## Future Enhancements

- [ ] Backend database integration
- [ ] User authentication system
- [ ] Link statistics and analytics
- [ ] Link expiration/scheduling
- [ ] Batch import/export
- [ ] Link testing/verification
- [ ] API endpoints
- [ ] Mobile app

## License

This project is open source and available for modification and distribution.

## Support

For issues or feature requests, please create an issue in the repository.
