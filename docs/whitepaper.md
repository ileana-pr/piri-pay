# FU Pay Me Whitepaper

## Executive Summary

We address a fundamental friction point in modern payments: the fragmentation of payment methods across multiple platforms and blockchains. Today, recipients have to share different wallet addresses for each cryptocurrency (Ethereum, Solana, Bitcoin) and separate usernames for each fiat payment app (Cash App, Venmo, Zelle). That creates a cumbersome experience where payers navigate multiple apps, manually enter addresses or usernames, and switch between different payment ecosystems.

We solve this with a unified payment profile that consolidates all payment methods into a single, shareable QR code. Users configure their wallet addresses and payment handles once; our app generates one QR code that serves as a universal payment gateway. When a payer scans the QR code, we show them a single, intuitive interface with all available payment options—cryptocurrency and fiat—in one place.

Our payment flow is three steps: scan, select, and approve. For crypto, payers connect their wallet, enter the amount, and sign—no copy-pasting addresses. For fiat, we use deep linking to open the right payment app (Cash App, Venmo, or Zelle) with recipient info and amount pre-filled. After a payment, we prompt payers to create their own profile, so each transaction can grow the network. The result is a frictionless experience that bridges fiat and crypto—as easy to receive a Bitcoin tip as a Venmo payment.

**Current status:** We support Ethereum (ETH & ERC-20), Base, Solana (SOL & SPL), Bitcoin (BTC), Cash App, Venmo, and Zelle, and we plan to add more payment methods and chains.

## Problem Statement

### The Fragmentation of Payment Methods

In today's digital economy, individuals and businesses accept payments through an ever-expanding array of methods. A content creator might accept tips via Venmo, CashApp, Bitcoin, Ethereum, and Solana. A service provider might offer payment through Zelle, multiple cryptocurrency networks, and various stablecoins. Each payment method requires its own identifier: a username for fiat apps, a wallet address for each blockchain, and sometimes specific contract addresses for tokens.

This fragmentation creates a fundamental usability problem. Recipients must maintain and share multiple pieces of information, while payers must navigate between different apps, wallets, and interfaces. It's like having a business card with seven different phone numbers—each for a different purpose—instead of one number that routes to the right place.

### The Friction in Current Payment Flows

**For Recipients:**
- Managing multiple wallet addresses and payment handles becomes a burden
- Sharing payment information requires sending multiple messages or maintaining complex profiles
- Updating payment methods means re-sharing information across all channels
- No single point of control for all payment preferences

**For Payers:**
- Uncertainty about which payment method the recipient prefers or has available
- Sharing long cryptocurrency addresses is error-prone and tedious
- Switching between different wallet apps and payment platforms breaks the payment flow
- Searching for usernames within payment apps (Venmo, CashApp) adds unnecessary steps

### The Cost of Errors

Cryptocurrency addresses are long strings of characters that are difficult to verify visually. A single typo can result in lost funds with no recourse. This risk creates hesitation, especially for casual users or those new to cryptocurrency. The cognitive load of verifying addresses, combined with the fear of making mistakes, creates a significant barrier to adoption.

### The Bridge Between Worlds

Perhaps the most significant challenge is bridging the gap between traditional fiat payments and cryptocurrency. Users comfortable with Venmo or CashApp may be intimidated by the complexity of cryptocurrency wallets. Conversely, crypto-native users may find fiat payment apps cumbersome. There's no unified experience that makes both payment types feel equally accessible and simple.

### The opportunity we see

We’re not trying to replace existing payment methods. We’re building a universal interface that makes all of them equally accessible through a single entry point. Like a universal remote for payments: one QR code that opens to every option we support.

## Solution Overview

### Our unified payment profile

We run on a simple principle: one profile, one QR code, all payment methods. Recipients configure their payment info once—wallet addresses per chain, usernames for fiat apps—and we generate a single QR code that works as a universal payment gateway. That QR is like a digital business card with a full payment interface.

When someone scans the QR code, we take them to a web-based payment page that shows all available options in one layout. No app download or account creation required—scan and pay. We show cryptocurrency and fiat side-by-side so it’s clear that every method is equally valid and accessible.

### The Payment Flow

**Step 1: Scan**
The payer scans the QR code with any smartphone camera or QR reader. The QR contains a URL to the recipient’s payment page. We generate that page from the recipient’s configured methods, so payers only see options that are actually available.

**Step 2: Select**
We show a visual grid of payment options. Crypto options are grouped (Ethereum, Solana, Bitcoin, Base, etc.); fiat apps are shown with their branding. The payer taps their preferred method.

**Step 3: Approve**
The flow depends on the method, but we keep both paths simple:

- **Crypto:** The payer connects their wallet (MetaMask, Phantom, WalletConnect, etc.), enters the amount, and signs. We pre-fill and verify the recipient’s address so there’s no copy-paste or address errors. The transaction runs on-chain.

- **Fiat:** We use deep linking to open the right app (Cash App, Venmo) with recipient and amount pre-filled. Where deep linking isn’t supported (e.g. Zelle), we copy the username and guide the payer to paste it. They confirm in their usual app.

**Step 4: Create profile (optional)**
After a payment, we prompt the payer to create their own profile. They can set up their own QR in one go. By catching users right after they’ve paid, we get a natural onboarding funnel and organic growth as more people join.

### How we design it

**No custody, no risk:** We never hold user funds. Crypto goes straight from the payer’s wallet to the recipient’s. Fiat is handled entirely inside Cash App, Venmo, or Zelle. We’re only a routing layer—a directory that connects payers to recipients by their preferred method.

**Platform agnostic:** Our app works on any device with a browser and QR scanning. Recipients create a profile to get their QR; payers can pay without an account—scan and pay. We encourage payers to create a profile after they’ve paid, but the QR is the only thing required to pay.

**Progressive enhancement:** We handle missing methods gracefully. No crypto wallet? Fiat still works. Recipient doesn’t accept crypto? We only show what they accept. The interface adapts to what’s possible.

### Our technical foundation

We built FU Pay Me as a web app that generates payment pages. The QR code encodes a URL that loads the recipient’s payment page. That gives us:
- No backend required for core functionality
- Payment info in the URL/page
- Natural scaling—each QR is independent
- New or updated payment methods = regenerate the QR

For crypto we integrate with standard wallet protocols (WalletConnect, browser extensions) for non-custodial transactions. For fiat we use deep linking in the payment apps, so the web UI and native apps connect smoothly. 