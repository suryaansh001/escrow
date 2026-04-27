# KYC Verification Feature

## Overview
The KYC (Know Your Customer) verification feature provides a DigiLocker-inspired interface for identity verification during the escrow process. This feature ensures compliance with regulatory requirements and enhances trust in the platform.

## Features

### Multi-Step Verification Process
1. **Personal Details**: Enter Aadhar Card and PAN Card numbers
2. **Document Upload**: Upload scanned images of Aadhar Card (front/back) and PAN Card
3. **Mobile Verification**: OTP verification via mobile number

### DigiLocker-Inspired UI
- Clean, government-like design with blue color scheme
- Step-by-step progress indicator
- Secure and user-friendly interface

### Validation & Security
- Aadhar number: 12-digit validation
- PAN number: Standard Indian PAN format validation (ABCDE1234F)
- File upload: Image files only, max 5MB
- OTP: 6-digit verification with simulation support

## Simulation Mode
For development and testing purposes, the system includes simulation features:
- **Default OTP**: `111111` (use this for testing)
- Mock API responses for all verification steps
- File upload validation without actual backend processing

## Usage

### Accessing KYC Verification
- Navigate to `/kyc` route
- Available from Dashboard Quick Actions when KYC status is not "Verified"
- Integrated into user onboarding flow

### API Integration
The frontend component is designed to integrate with backend KYC APIs:
- Document upload endpoints
- OTP generation and verification
- KYC status updates

## Technical Implementation

### Components Used
- React with TypeScript
- Framer Motion for animations
- React Hook Form for form management
- Shadcn/ui components for consistent design
- Input-OTP for secure OTP input

### File Structure
```
src/pages/KYC.tsx          # Main KYC component
src/test/KYC.test.tsx       # Component tests
```

### State Management
- Local component state for form data
- File upload handling with validation
- Step-based navigation with progress tracking

## Testing
Run tests with:
```bash
npm test -- KYC.test.tsx
```

Tests cover:
- Component rendering
- Step navigation
- Form validation
- Progress indicators

## Future Enhancements
- Real API integration
- Advanced document scanning
- Biometric verification
- Multi-language support
- Accessibility improvements