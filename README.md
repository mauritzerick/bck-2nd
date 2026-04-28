## Brick Dynamic QRIS Deposit Demo

This project is a simple Next.js deposit flow that:
- accepts an amount from the user
- requests a Dynamic QRIS from Brick via server API route
- renders the returned `qrData` as a scannable QR code

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```bash
BRICK_CLIENT_ID=your_brick_client_id
BRICK_CLIENT_SECRET=your_brick_client_secret
BRICK_BASE_URL=https://sandbox.onebrick.io/v2
```

You can copy from `.env.example`.

## Run

```bash
npm run dev
```

Then open:
- `http://localhost:3000` (home)
- `http://localhost:3000/deposit` (QR deposit page)

## API Flow

1. Frontend posts amount to `POST /api/deposit/qris`
2. Server obtains Brick `publicAccessToken`
3. Server calls Brick Dynamic QRIS endpoint
4. Frontend renders QR image from returned `qrData`
# bck-2nd
